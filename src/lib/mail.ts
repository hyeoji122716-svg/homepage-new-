import nodemailer, { type Transporter } from "nodemailer";
import { INQUIRY_TYPE_LABELS } from "@/lib/types";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface InquiryMail {
  name: string;
  org: string;
  email: string;
  phone: string | null;
  type: string;
  message: string;
}

/**
 * 새 문의 접수 시 관리자에게 알림 메일 발송.
 * 메일 설정이 없거나 실패해도 예외를 던지지 않고, 문의 저장 자체는 유지되도록 한다.
 */
export async function sendInquiryNotification(inquiry: InquiryMail): Promise<void> {
  const to = process.env.INQUIRY_NOTIFY_TO;
  const t = getTransporter();

  if (!t || !to) {
    console.warn(
      "알림 메일 건너뜀: GMAIL_USER / GMAIL_APP_PASSWORD / INQUIRY_NOTIFY_TO 환경변수를 확인하세요."
    );
    return;
  }

  const typeLabel = INQUIRY_TYPE_LABELS[inquiry.type] ?? inquiry.type;

  const rows: [string, string][] = [
    ["이름", inquiry.name],
    ["소속", inquiry.org],
    ["이메일", inquiry.email],
    ["연락처", inquiry.phone || "-"],
    ["문의 유형", typeLabel],
  ];

  const textBody =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\n[문의 내용]\n${inquiry.message}`;

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#222">
      <h2 style="margin:0 0 16px">새 문의가 접수되었습니다</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:96px;border:1px solid #eee">${k}</td>
                 <td style="padding:8px 12px;border:1px solid #eee">${escapeHtml(v)}</td>
               </tr>`
          )
          .join("")}
      </table>
      <div style="margin-top:16px;padding:14px;background:#fafafa;border:1px solid #eee;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(
        inquiry.message
      )}</div>
    </div>`;

  const info = await t.sendMail({
    from: `"커넥트유 문의 알림" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: inquiry.email,
    subject: `[커넥트유 문의] ${inquiry.name} · ${typeLabel}`,
    text: textBody,
    html: htmlBody,
  });
  console.log(`알림 메일 발송 성공 → ${to} (messageId: ${info.messageId})`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
