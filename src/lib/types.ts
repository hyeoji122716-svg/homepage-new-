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
