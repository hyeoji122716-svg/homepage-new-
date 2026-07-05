import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendInquiryNotification } from "@/lib/mail";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const org = String(body.org ?? "").trim();
  const type = String(body.type ?? "").trim();
  const message = String(body.message ?? "").trim();
  const consent = body.consent === true;

  if (!consent) {
    return NextResponse.json(
      { error: "개인정보 수집·이용 동의가 필요합니다." },
      { status: 400 }
    );
  }

  if (!name || !email || !org || !type || !message) {
    return NextResponse.json(
      { error: "이름, 소속, 이메일, 문의 유형, 문의 내용은 필수 항목입니다." },
      { status: 400 }
    );
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return NextResponse.json(
      { error: "이메일 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const VALID_TYPES = ["lecture", "education", "consulting", "etc"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "문의 유형이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (name.length > 100 || email.length > 200 || org.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { error: "입력 값이 너무 깁니다." },
      { status: 400 }
    );
  }

  const phone = String(body.phone ?? "").trim() || null;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      org,
      type,
      message,
      phone,
      privacy_consent: true,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 알림 메일 발송 (실패해도 접수는 유지)
    try {
      await sendInquiryNotification({ name, email, org, phone, type, message });
    } catch (mailErr) {
      console.error("알림 메일 발송 실패:", mailErr);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Inquiry POST error:", e);
    return NextResponse.json(
      { error: "서버 설정 오류입니다. 관리자에게 문의하세요." },
      { status: 500 }
    );
  }
}
