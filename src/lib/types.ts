export type InquiryStatus = "new" | "in_progress" | "done";

export interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  org: string | null;
  email: string;
  phone: string | null;
  type: string | null;
  message: string;
  status: InquiryStatus;
  privacy_consent: boolean;
}

export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  lecture: "기업 강연",
  education: "교육 프로그램 운영",
  consulting: "마케팅 컨설팅",
  etc: "기타",
};

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "신규",
  in_progress: "처리중",
  done: "완료",
};

// ── 예약(bookings) ─────────────────────────────────────────
export type ConsultType = "60" | "30";

export interface Booking {
  id: string;
  slot_date: string; // 'YYYY-MM-DD' (Asia/Seoul 기준 날짜)
  start_time: string; // 'HH:MM:SS' (Asia/Seoul 기준 시각, 정각)
  project_name: string; // 사업명 (PROJECTS 중 하나)
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  consult_type: ConsultType;
  sns_url: string | null;
  pre_question: string | null;
  cancel_token: string;
  created_at: string;
  cancelled_at: string | null; // null 이면 유효 예약
}
