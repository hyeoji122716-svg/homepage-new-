import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase";
import { BOOKING_MONTHS, fromDbTime, slotEnd } from "@/lib/booking/config";
import { isPastLeadTime } from "@/lib/booking/lead-time";
import type { Availability, DayAvailability } from "@/lib/types";

/** DAILY_BOOKING_LIMIT 미설정 시 쓰는 값 */
const DEFAULT_DAILY_LIMIT = 4;

/** BOOKING_LEAD_TIME_HOURS 미설정 시 쓰는 값 */
const DEFAULT_LEAD_TIME_HOURS = 24;

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

/**
 * 컨설팅 시작 몇 시간 전까지 예약을 받을지.
 * 환경변수 BOOKING_LEAD_TIME_HOURS 로 바꾼다. (하드코딩 금지)
 * 0 이면 시작 시각 전까지 계속 받는다.
 */
export function bookingLeadTimeHours(): number {
  const raw = process.env.BOOKING_LEAD_TIME_HOURS;
  if (!raw) return DEFAULT_LEAD_TIME_HOURS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) {
    console.warn(
      `BOOKING_LEAD_TIME_HOURS 값이 올바르지 않습니다(${raw}). 기본값 ${DEFAULT_LEAD_TIME_HOURS} 를 씁니다.`
    );
    return DEFAULT_LEAD_TIME_HOURS;
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
  const leadTimeHours = bookingLeadTimeHours();
  // 한 번의 응답 안에서는 같은 "지금"으로 판단한다(슬롯마다 시각이 흔들리지 않게).
  const nowMs = Date.now();
  const slots = await fetchOpenSlots();
  const dateList = [...new Set(slots.map((s) => s.slot_date))];

  // 슬롯이 0건이면 달력에 고를 수 있는 날짜가 하나도 없다.
  // 정말 미등록일 수도 있지만, DB 에 행이 있는데도 0건이면 연결/키 문제다.
  if (slots.length === 0) {
    console.warn(
      "booking_slots 조회 결과가 0건입니다. " +
        "슬롯을 등록하지 않았다면 정상이지만, DB 에 행이 있는데 0건이면 " +
        "NEXT_PUBLIC_SUPABASE_URL 이 다른 프로젝트를 보고 있거나 " +
        "SUPABASE_SERVICE_ROLE_KEY 가 service_role 키가 아닌 경우입니다."
    );
  }

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
      dates[date] = {
        booked,
        limit,
        full: booked >= limit,
        closed: true, // 슬롯을 다 넣은 뒤 아래에서 다시 계산한다
        slots: [],
      };
    }

    const end = slotEnd(start);
    dates[date].slots.push({
      start,
      end,
      label: `${start} ~ ${end}`,
      booked: takenSlots.has(`${date} ${start}`),
      closed: isPastLeadTime(date, start, leadTimeHours, nowMs),
    });
  }

  // 그날 슬롯이 전부 리드타임을 넘겼으면 날짜째 닫는다(달력에서 카드를 접는다).
  for (const day of Object.values(dates)) {
    day.closed = day.slots.length > 0 && day.slots.every((s) => s.closed);
  }

  return { months: monthsFromDates(dateList), limit, leadTimeHours, dates };
}
