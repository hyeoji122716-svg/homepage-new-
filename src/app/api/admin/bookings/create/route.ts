import type { NextRequest } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  consultTypeForProject,
  isValidProject,
  slotLabel,
  toDbTime,
} from "@/lib/booking/config";
import { dailyBookingLimit } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const START_RE = /^\d{2}:\d{2}$/;

/**
 * 관리자 대리 예약 등록.
 *
 * 고객 화면(/api/booking/reserve)과 같은 create_booking 을 부르지만,
 * p_lead_hours 를 null 로 넘겨 **리드타임 규칙만** 우회한다.
 * 전화로 들어온 임박 요청을 담당자가 대신 넣어야 하기 때문이다.
 *
 * ⚠️ 우회하는 건 리드타임뿐이다. 아래는 그대로 적용된다.
 *    - 열려 있는 슬롯인지 (BK001)
 *    - 슬롯 중복 (BK002)
 *    - 하루 상한 (BK003)
 *    - 같은 이메일 중복 (BK004)
 *    이중 예약이나 상한 초과는 관리자라도 만들 수 없어야 한다.
 */
const RPC_ERRORS: Record<string, { status: number; message: string }> = {
  BK001: { status: 400, message: "예약할 수 없는 시간입니다." },
  BK002: { status: 409, message: "이미 마감된 시간입니다." },
  BK003: { status: 409, message: "해당 날짜는 하루 예약 상한에 도달했습니다." },
  BK004: { status: 409, message: "이미 예약된 내역이 있습니다." },
};

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

  const slotDate = String(body.slot_date ?? "").trim();
  const start = String(body.start_time ?? "").trim(); // 'HH:MM'
  const projectName = String(body.project_name ?? "").trim();
  const companyName = String(body.company_name ?? "").trim();
  const contactName = String(body.contact_name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const snsUrl = String(body.sns_url ?? "").trim() || null;
  const preQuestion = String(body.pre_question ?? "").trim() || null;

  if (!DATE_RE.test(slotDate) || !START_RE.test(start)) {
    return Response.json({ error: "예약할 수 없는 시간입니다." }, { status: 400 });
  }
  if (!isValidProject(projectName)) {
    return Response.json({ error: "사업명을 선택해 주세요." }, { status: 400 });
  }
  if (!companyName || !contactName || !phone || !email) {
    return Response.json(
      { error: "기업명, 담당자명, 연락처, 이메일은 필수 항목입니다." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { error: "이메일 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const consultType = consultTypeForProject(projectName);

  try {
    const { data, error } = await getSupabaseAdmin()
      .rpc("create_booking", {
        p_slot_date: slotDate,
        p_start_time: toDbTime(start),
        p_project_name: projectName,
        p_company_name: companyName,
        p_contact_name: contactName,
        p_phone: phone,
        p_email: email,
        p_consult_type: consultType,
        p_sns_url: snsUrl,
        p_pre_question: preQuestion,
        p_daily_limit: dailyBookingLimit(),
        p_lead_hours: null, // ← 관리자 예외: 리드타임 검사 건너뜀
      })
      .single<{ id: string; cancel_token: string }>();

    if (error) {
      const known = RPC_ERRORS[error.code ?? ""];
      if (known) {
        return Response.json(
          { error: known.message, code: error.code },
          { status: known.status }
        );
      }
      throw new Error(error.message);
    }

    // 대리 등록은 담당자가 이미 내용을 아는 건이라 알림 메일을 보내지 않는다.
    return Response.json(
      {
        ok: true,
        id: data.id,
        cancel_token: data.cancel_token,
        slot_date: slotDate,
        time_label: slotLabel(start),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("관리자 예약 등록 오류:", e);
    return Response.json(
      { error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
