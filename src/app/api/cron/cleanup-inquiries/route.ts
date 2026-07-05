import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyCronAuth } from "@/lib/cron";
import { logCronRun } from "@/lib/cronLog";
import { RETENTION_YEARS } from "@/lib/config";

const JOB = "cleanup-inquiries";

// 매월 1회 실행: 보유기간(RETENTION_YEARS년)이 지난 문의를 삭제
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 기준 시각: 지금으로부터 RETENTION_YEARS년 전
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("inquiries")
      .delete()
      .lt("created_at", cutoff.toISOString())
      .select("id");

    if (error) {
      console.error("문의 정리 배치 실패:", error);
      await logCronRun({ job: JOB, status: "error", detail: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deleted = data?.length ?? 0;
    console.log(
      `문의 정리 배치 완료: ${deleted}건 삭제 (기준: ${cutoff.toISOString()} 이전)`
    );
    await logCronRun({
      job: JOB,
      status: "success",
      affected: deleted,
      detail: `${RETENTION_YEARS}년 경과분 삭제 (기준 ${cutoff.toISOString()} 이전)`,
    });
    return NextResponse.json({
      ok: true,
      deleted,
      cutoff: cutoff.toISOString(),
      retentionYears: RETENTION_YEARS,
    });
  } catch (e) {
    console.error("문의 정리 배치 오류:", e);
    await logCronRun({
      job: JOB,
      status: "error",
      detail: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }
}
