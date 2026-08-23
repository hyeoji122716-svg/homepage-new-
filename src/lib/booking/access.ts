import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * 예약 페이지 비밀 URL 접근 토큰.
 *
 * ⚠️ 이건 진짜 보안이 아니다. URL(토큰)을 아는 사람은 누구나 들어올 수 있다.
 * "아는 사람만 들어오는" 수준의 장치일 뿐이다.
 *
 * 페이지뿐 아니라 예약 관련 API 도 같은 토큰으로 막는다.
 * (페이지만 막고 API 를 열어두면 의미가 없다.)
 */

export function bookingAccessToken(): string | null {
  return process.env.BOOKING_ACCESS_TOKEN || null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** 주어진 토큰이 설정된 접근 토큰과 일치하는지. 토큰 미설정이면 항상 false. */
export function checkBookingToken(token: string | null | undefined): boolean {
  const expected = bookingAccessToken();
  if (!expected || !token) return false;
  return safeEqual(token, expected);
}

/**
 * 예약 API 접근 검증. 실패 시 401 Response, 통과하면 null.
 * 클라이언트는 URL 의 토큰을 `x-booking-token` 헤더로 실어 보낸다.
 */
export function requireBookingAccess(request: Request): Response | null {
  const token = request.headers.get("x-booking-token");
  if (!checkBookingToken(token)) {
    return Response.json({ error: "접근 권한이 없습니다." }, { status: 401 });
  }
  return null;
}
