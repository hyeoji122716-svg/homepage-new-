import type { NextRequest } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { requireBookingAccess } from "@/lib/booking/access";
import {
  consultTypeForProject,
  isOpenSlot,
  isValidProject,
  slotLabel,
  toDbTime,
} from "@/lib/booking/config";
import { sendBookingNotification } from "@/lib/mail";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // 열어둔 슬롯인지 서버에서 검증 (임의의 날짜/시간 예약 차단)
  if (!isOpenSlot(slotDate, start)) {
    return Response.json(
      { error: "예약할 수 없는 시간입니다." },
      { status: 400 }
    );
  }

  if (!isValidProject(projectName)) {
    return Response.json(
      { error: "사업명을 선택해 주세요." },
      { status: 400 }
    );
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
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .insert({
        slot_date: slotDate,
        start_time: toDbTime(start),
        project_name: projectName,
        company_name: companyName,
        contact_name: contactName,
        phone,
        email,
        consult_type: consultType,
        sns_url: snsUrl,
        pre_question: preQuestion,
      })
      .select("cancel_token")
      .single();

    if (error) {
      // 부분 유니크 인덱스 위반 = 이미 예약된 슬롯
      if (error.code === "23505") {
        return Response.json(
          { error: "이미 마감된 시간입니다." },
          { status: 409 }
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
