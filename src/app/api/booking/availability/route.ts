import type { NextRequest } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { requireBookingAccess } from "@/lib/booking/access";
import {
  BOOKING_MONTHS,
  OPEN_SLOTS,
  openDates,
  slotEnd,
  fromDbTime,
} from "@/lib/booking/config";

// 쿠키/실시간 예약 상태를 읽으므로 캐시하지 않는다.
export const dynamic = "force-dynamic";

/**
 * 예약 화면용 데이터.
 * - months: 달력에 보여줄 달
 * - dates: 열어둔 날짜별 슬롯 목록 (예약된 슬롯은 booked=true)
 */
export async function GET(request: NextRequest) {
  const denied = requireBookingAccess(request);
  if (denied) return denied;

  const dates = openDates();

  // 유효(취소 안 된) 예약을 가져와 마감 슬롯을 계산한다.
  let bookedKeys = new Set<string>();
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("slot_date, start_time")
      .is("cancelled_at", null)
      .in("slot_date", dates.length > 0 ? dates : ["__none__"]);

    if (error) throw new Error(error.message);
    bookedKeys = new Set(
      (data ?? []).map(
        (b: { slot_date: string; start_time: string }) =>
          `${b.slot_date} ${fromDbTime(b.start_time)}`
      )
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  const result: Record<
    string,
    { start: string; end: string; label: string; booked: boolean }[]
  > = {};

  for (const date of dates) {
    result[date] = (OPEN_SLOTS[date] ?? []).map((start) => {
      const end = slotEnd(start);
      return {
        start,
        end,
        label: `${start} ~ ${end}`,
        booked: bookedKeys.has(`${date} ${start}`),
      };
    });
  }

  return Response.json({ months: BOOKING_MONTHS, dates: result });
}
