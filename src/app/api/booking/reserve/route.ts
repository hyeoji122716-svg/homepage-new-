import type { NextRequest } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { requireBookingAccess } from "@/lib/booking/access";
import {
  consultTypeForProject,
  isValidProject,
  slotLabel,
  toDbTime,
} from "@/lib/booking/config";
import { dailyBookingLimit } from "@/lib/booking/slots";
import { sendBookingNotification } from "@/lib/mail";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const START_RE = /^\d{2}:\d{2}$/;

/**
 * create_booking(supabase/functions.sql) 이 SQLSTATE 로 돌려주는 실패 사유.
 * 슬롯 중복과 하루 상한을 다른 문구로 보여줘야 해서 코드로 구분한다.
 */
const RPC_ERRORS: Record<string, { status: number; message: string }> = {
  BK001: { status: 400, message: "예약할 수 없는 시간입니다." },
  BK002: { status: 409, message: "이미 마감된 시간입니다." },
  BK003: { status: 409, message: "해당 날짜는 예약이 마감되었습니다." },
  BK004: { status: 409, message: "이미 예약된 내역이 있습니다." },
};

/** 예약 접수 */
export async function POST(request: NextRequest) {
  const denied = requireBookingAccess(request);
  if (denied) return denied;

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

  // 형식만 여기서 보고, "열어둔 슬롯인지"는 함수 안에서 잠금을 잡은 뒤 확인한다.
  if (!DATE_RE.test(slotDate) || !START_RE.test(start)) {
    return Response.json(
      { error: "예약할 수 없는 시간입니다." },
      { status: 400 }
    );
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
  // 상담 유형은 사업명으로 자동 결정한다(클라이언트 값 무시).
  const consultType = consultTypeForProject(projectName);

  if (
    companyName.length > 200 ||
    contactName.length > 100 ||
    phone.length > 50 ||
    email.length > 200 ||
    (snsUrl && snsUrl.length > 500) ||
    (preQuestion && preQuestion.length > 5000)
  ) {
    return Response.json({ error: "입력 값이 너무 깁니다." }, { status: 400 });
  }

  try {
    // 슬롯 확인 → 하루 상한 확인 → insert 를 한 트랜잭션에서 처리한다.
    // 함수 안에서 그 날짜를 advisory lock 으로 잠그므로,
    // 동시에 들어온 요청이 상한을 넘겨 들어갈 수 없다.
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
      })
      .single<{ id: string; cancel_token: string }>();

    if (error) {
      const known = RPC_ERRORS[error.code ?? ""];
      if (known) {
        // code 를 같이 내려준다. 클라이언트가 문구를 비교하지 않고
        // "하루 상한에 걸렸다"(BK003)를 구분해서 다르게 처리할 수 있게.
        return Response.json(
          { error: known.message, code: error.code },
          { status: known.status }
        );
      }
      throw new Error(error.message);
    }

    const timeLabel = slotLabel(start);

    // 알림 메일 (실패해도 예약은 유지)
    try {
      await sendBookingNotification({
        project_name: projectName,
        company_name: companyName,
        contact_name: contactName,
        phone,
        email,
        consult_type: consultType,
        sns_url: snsUrl,
        pre_question: preQuestion,
        slot_date: slotDate,
        time_label: timeLabel,
      });
    } catch (mailErr) {
      console.error("예약 알림 메일 발송 실패:", mailErr);
    }

    return Response.json(
      {
        ok: true,
        cancel_token: data.cancel_token,
        slot_date: slotDate,
        time_label: timeLabel,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("예약 접수 오류:", e);
    return Response.json(
      { error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
