import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트.
 * service_role 키를 사용하므로 절대 클라이언트 컴포넌트에서 import 하지 마세요.
 * (이 키는 RLS를 우회합니다.)
 */
let cached: SupabaseClient | null = null;

/**
 * 넣은 키가 정말 service_role 인지 본다.
 *
 * ⚠️ 이 검사가 없으면 잘못된 키(publishable/anon)를 넣어도 조용히 넘어간다.
 *    모든 테이블이 RLS 인데 정책이 하나도 없어서, service_role 이 아닌 키로는
 *    에러 대신 "200 OK + 빈 배열" 이 돌아온다. 그러면 예약 달력이 슬롯 0건으로
 *    보여서 "DB 에 데이터는 있는데 날짜가 전부 비활성" 인 상태가 된다.
 *    빈 결과로 위장되느니 여기서 바로 터지는 편이 낫다.
 */
function assertServiceRoleKey(key: string): void {
  const wrong = (what: string) =>
    new Error(
      `SUPABASE_SERVICE_ROLE_KEY 에 ${what}가 들어가 있습니다. ` +
        "Supabase 대시보드 > Project Settings > API Keys 에서 service_role(secret) 키로 바꾸세요. " +
        "이 키가 아니면 RLS 때문에 모든 조회가 빈 결과로 돌아옵니다."
    );

  // 새 형식 키: sb_secret_... 는 정상, sb_publishable_... 는 공개용
  if (key.startsWith("sb_publishable_")) throw wrong("publishable(공개용) 키");

  // 레거시 JWT 형식이면 role 클레임을 확인한다.
  const parts = key.split(".");
  if (parts.length !== 3) return;

  let role: unknown;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );
    role = payload.role;
  } catch {
    return; // 못 읽으면 판단하지 않는다 (오탐으로 막지 않기)
  }

  if (typeof role === "string" && role !== "service_role") {
    throw wrong(`role="${role}" 키`);
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요."
    );
  }

  assertServiceRoleKey(serviceKey);

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
