import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase";
import { BOOKING_MONTHS, fromDbTime, slotEnd } from "@/lib/booking/config";
import type { Availability, DayAvailability } from "@/lib/types";

/** DAILY_BOOKING_LIMIT 미설정 시 쓰는 값 */
const DEFAULT_DAILY_LIMIT = 4;

/**
 * 하루에 받을 수 있는 유효 예약 건수 상한.
 * 환경변수 DAILY_BOOKING_LIMIT 로 바꾼다. (하드코딩 금지)
 */
export function dailyBookingLimit(): number {
  const raw = process.env.DAILY_BOOKING_LIMIT;
  if (!raw) return DEFAULT_DAILY_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    console.warn(
      `DAILY_BOOKING_LIMIT 값이 올바르지 않습니다(${raw}). 기본값 ${DEFAULT_DAILY_LIMIT} 을 씁니다.`
    );
    return DEFAULT_DAILY_LIMIT;
  }
  return n;
}

export interface OpenSlotRow {
  slot_date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:MM:SS'
}

/** 등록된 예약 슬롯 전체 (날짜/시각 오름차순) */
export async function fetchOpenSlots(): Promise<OpenSlotRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("booking_slots")
    .select("slot_date, start_time")
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as OpenSlotRow[]) ?? [];
}

/** 날짜 목록에서 달력에 보여줄 달 목록을 만든다. 비어 있으면 기본 달. */
function monthsFromDates(dates: string[]): { year: number; month: number }[] {
  const seen = new Set<string>();
  const months: { year: number; month: number }[] = [];

  for (const d of dates) {
    const key = d.slice(0, 7); // 'YYYY-MM'
    if (seen.has(key)) continue;
    seen.add(key);
    months.push({ year: Number(d.slice(0, 4)), month: Number(d.slice(5, 7)) });
  }

  if (months.length === 0) return BOOKING_MONTHS;
  months.sort((a, b) => a.year - b.year || a.month - b.month);
  return months;
}

/**
 * 예약 화면/관리자 화면이 함께 쓰는 "지금 예약 가능한 상태".
 *
 * ⚠️ 마감 여부는 저장하지 않는다. 항상 조회 시점에 계산한다.
 *    (취소되면 유효 예약 수가 줄어 자동으로 다시 열린다.)
 */
export async function loadAvailability(): Promise<Availability> {
  const limit = dailyBookingLimit();
  const slots = await fetchOpenSlots();
  const dateList = [...new Set(slots.map((s) => s.slot_date))];

  // 유효(취소 안 된) 예약만 가져와 슬롯 마감/하루 상한을 계산한다.
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("slot_date, start_time")
    .is("cancelled_at", null)
    .in("slot_date", dateList.length > 0 ? dateList : ["1970-01-01"]);

  if (error) throw new Error(error.message);

  const takenSlots = new Set<string>();
  const bookedPerDate = new Map<string, number>();

  for (const b of (data ?? []) as OpenSlotRow[]) {
    takenSlots.add(`${b.slot_date} ${fromDbTime(b.start_time)}`);
    bookedPerDate.set(b.slot_date, (bookedPerDate.get(b.slot_date) ?? 0) + 1);
  }

  const dates: Record<string, DayAvailability> = {};

  for (const row of slots) {
    const date = row.slot_date;
    const start = fromDbTime(row.start_time);

    if (!dates[date]) {
      const booked = bookedPerDate.get(date) ?? 0;
      dates[date] = { booked, limit, full: booked >= limit, slots: [] };
    }

    const end = slotEnd(start);
    dates[date].slots.push({
      start,
      end,
      label: `${start} ~ ${end}`,
      booked: takenSlots.has(`${date} ${start}`),
    });
  }

  return { months: monthsFromDates(dateList), limit, dates };
}
