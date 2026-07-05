import type { NextRequest } from "next/server";

/**
 * Vercel Cron 요청 인증.
 * Vercel은 CRON_SECRET 이 설정돼 있으면 크론 호출 시
 * `Authorization: Bearer <CRON_SECRET>` 헤더를 자동으로 붙인다.
 * 이 검증으로 외부의 임의 호출(무단 삭제 등)을 차단한다.
 */
export function verifyCronAuth(
  request: NextRequest
): { ok: true } | { ok: false; status: number; error: string } {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, status: 500, error: "CRON_SECRET 이 설정되지 않았습니다." };
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}
