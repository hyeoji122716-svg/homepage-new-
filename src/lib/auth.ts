import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cu_admin";

/**
 * 쿠키에 저장할 세션 토큰. 원문 비밀번호 대신 해시를 저장한다.
 */
export function sessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto
    .createHash("sha256")
    .update(`connectu-admin::${password}`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** 로그인 시 입력 비밀번호 검증 */
export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) return false;
  return safeEqual(input, password);
}

/** 요청 쿠키로 관리자 인증 여부 확인 */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, sessionToken());
}
