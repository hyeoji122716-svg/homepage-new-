import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * 배치(cron) 실행 결과를 cron_logs 테이블에 기록.
 * 로그 기록 실패가 배치 자체를 중단시키지 않도록 예외를 삼킨다.
 */
export async function logCronRun(params: {
  job: string;
  status: "success" | "error";
  affected?: number | null;
  detail?: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("cron_logs").insert({
      job: params.job,
      status: params.status,
      affected: params.affected ?? null,
      detail: params.detail ?? null,
    });
    if (error) {
      console.error("cron_logs 기록 실패:", error.message);
    }
  } catch (e) {
    console.error("cron_logs 기록 실패:", e);
  }
}
