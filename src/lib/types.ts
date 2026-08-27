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

/** 예약 화면에 보여줄 슬롯 한 칸 */
export interface SlotInfo {
  start: string; // 'HH:MM'
  end: string; // 'HH:MM'
  label: string; // '10:00 ~ 11:00'
  booked: boolean; // 그 슬롯에 유효 예약이 있음
}

/** 어떤 날짜 하루의 예약 가능 상태. 저장하지 않고 조회 시점에 계산한다. */
export interface DayAvailability {
  booked: number; // 그날 유효 예약 수
  limit: number; // 하루 상한 (DAILY_BOOKING_LIMIT)
  full: boolean; // booked >= limit 이면 그날 남은 슬롯은 전부 예약 불가
  slots: SlotInfo[];
}

export interface Availability {
  months: { year: number; month: number }[];
  limit: number;
  dates: Record<string, DayAvailability>; // key: 'YYYY-MM-DD'
}

/** 관리자 슬롯 붙여넣기 등록 결과 */
export interface SlotParseIssue {
  line: number; // 1부터 세는 줄 번호
  text: string; // 문제가 된 줄 원문
  message: string;
}

export interface SlotPreviewItem {
  date: string; // 'YYYY-MM-DD'
  start: string; // 'HH:MM'
  duplicate: boolean; // 이미 등록되어 있는 슬롯
}

export interface SlotRegisterResult {
  issues: SlotParseIssue[];
  items: SlotPreviewItem[];
  newCount: number; // 등록될(된) 개수
  dupCount: number; // 이미 있어서 건너뛸(뛴) 개수
  registered: boolean; // true 면 실제로 DB 에 반영됨
}
