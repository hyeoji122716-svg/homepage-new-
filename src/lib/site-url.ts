import "server-only";

import { headers } from "next/headers";

/**
 * 사이트 기본 주소 ('https://example.com', 끝에 / 없음).
 *
 * 예약 완료 화면에서 "예약 확인 주소"를 도메인까지 붙여 보여주기 위한 값이다.
 * 경로만 보여주면 사용자가 복사해서 다른 곳에 붙여넣을 때 못 쓴다.
 *
 * 1) NEXT_PUBLIC_SITE_URL 이 있으면 그걸 쓴다. (메일 본문 등 요청 밖에서도 필요)
 * 2) 없으면 요청 헤더에서 만든다. 프록시(Vercel) 뒤에서는 x-forwarded-* 가 원본이다.
 *
 * 둘 다 못 구하면 빈 문자열을 준다. 화면은 이때 경로만 보여준다(깨지지 않게).
 */
export async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";

  // 로컬 개발은 http, 그 외에는 프록시가 알려준 프로토콜(없으면 https)
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");

  return `${proto}://${host}`;
}
