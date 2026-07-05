import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyCronAuth } from "@/lib/cron";
import { logCronRun } from "@/lib/cronLog";

const JOB = "keep-alive";

// 3일마다 실행: 가벼운 쿼리로 Supabase 무료 프로젝트의 자동 일시정지(7일 무활동)를 방지
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = getSupabaseAdmin();
    // 가장 가벼운 조회: 실제 행 데이터를 받지 않고 개수만 확인(head)
    const { count, error } = await supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("keep-alive 실패:", error);
      await logCronRun({ job: JOB, status: "error", detail: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`keep-alive OK (inquiries count=${count})`);
    await logCronRun({
      job: JOB,
      status: "success",
      affected: count ?? null,
      detail: `inquiries count=${count}`,
    });
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    console.error("keep-alive 오류:", e);
    await logCronRun({
      job: JOB,
      status: "error",
      detail: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "서버 설정 오류입니다." }, { status: 500 });
  }
}
