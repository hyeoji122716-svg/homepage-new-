import type { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { toDbTime } from "@/lib/booking/config";
import { parseSlotText } from "@/lib/booking/parse-slots";
import type { SlotPreviewItem, SlotRegisterResult } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * 관리자 슬롯 등록 (텍스트 붙여넣기).
 *
 * body: { text: string, commit?: boolean }
 *   commit=false(기본) → 미리보기만. DB 를 건드리지 않는다.
 *   commit=true        → 실제 등록. 단, 파싱 에러가 하나라도 있으면 등록하지 않는다.
 *
 * 기존 슬롯과 겹치면 on conflict do nothing 으로 조용히 건너뛴다.
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

  const text = String(body.text ?? "");
  const commit = body.commit === true;

  if (text.length > 100_000) {
    return Response.json({ error: "입력이 너무 깁니다." }, { status: 400 });
  }

  const { slots, issues } = parseSlotText(text);

  const supabase = getSupabaseAdmin();

  // 이미 등록된 슬롯인지 확인해서 "N개 등록 / M개 중복" 을 보여준다.
  const dates = [...new Set(slots.map((s) => s.date))];
  let existing = new Set<string>();

  if (dates.length > 0) {
    const { data, error } = await supabase
      .from("booking_slots")
      .select("slot_date, start_time")
      .in("slot_date", dates);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    existing = new Set(
      (data ?? []).map(
        (r: { slot_date: string; start_time: string }) =>
          `${r.slot_date} ${r.start_time.slice(0, 5)}`
      )
    );
  }

  const items: SlotPreviewItem[] = slots.map((s) => ({
    date: s.date,
    start: s.start,
    duplicate: existing.has(`${s.date} ${s.start}`),
  }));

  const fresh = items.filter((i) => !i.duplicate);

  const result: SlotRegisterResult = {
    issues,
    items,
    newCount: fresh.length,
    dupCount: items.length - fresh.length,
    registered: false,
  };

  if (!commit) {
    return Response.json(result);
  }

  if (issues.length > 0) {
    return Response.json(
      { ...result, error: "형식 오류를 먼저 고쳐주세요." },
      { status: 400 }
    );
  }

  if (fresh.length > 0) {
    // (slot_date, start_time)이 기본키라 중복은 무시된다 = on conflict do nothing
    const { error } = await supabase.from("booking_slots").upsert(
      fresh.map((s) => ({ slot_date: s.date, start_time: toDbTime(s.start) })),
      { onConflict: "slot_date,start_time", ignoreDuplicates: true }
    );

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return Response.json({ ...result, registered: true });
}
