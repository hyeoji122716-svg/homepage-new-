import type { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * 관리자 예약 취소. 취소는 여기서만 할 수 있다(고객사 셀프 취소 없음).
 *
 * 행을 지우지 않고 cancelled_at 만 채운다. 부분 유니크 인덱스
 * (bookings_active_slot_unique)가 cancelled_at is null 조건이라,
 * 취소하는 순간 그 슬롯은 자동으로 다시 예약 가능해진다.
 * 하루 상한도 유효 예약 수로 계산하므로 같이 풀린다.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return Response.json({ error: "예약 id 가 없습니다." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", id)
    .is("cancelled_at", null) // 이미 취소된 건은 다시 덮어쓰지 않는다
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("예약 취소 오류:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json(
      { error: "이미 취소되었거나 없는 예약입니다." },
      { status: 404 }
    );
  }

  return Response.json({ ok: true });
}
