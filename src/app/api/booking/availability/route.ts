import type { NextRequest } from "next/server";

import { requireBookingAccess } from "@/lib/booking/access";
import { loadAvailability } from "@/lib/booking/slots";

// 실시간 예약 상태를 읽으므로 캐시하지 않는다.
export const dynamic = "force-dynamic";

/**
 * 예약 화면용 데이터.
 * - months: 달력에 보여줄 달 (등록된 슬롯이 있는 달)
 * - limit : 하루 예약 상한
 * - dates : 날짜별 { booked, limit, full, slots[] }
 *
 * 마감 여부(full / slot.booked)는 저장하지 않고 매 요청마다 계산한다.
 * 예약이 취소되면 다음 조회부터 자동으로 다시 열린다.
 */
export async function GET(request: NextRequest) {
  const denied = requireBookingAccess(request);
  if (denied) return denied;

  try {
    return Response.json(await loadAvailability());
  } catch (e) {
    console.error("예약 가능 슬롯 조회 오류:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
