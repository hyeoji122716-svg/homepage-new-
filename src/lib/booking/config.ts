/**
 * 예약 공통 설정 (클라이언트/서버 양쪽에서 import 한다).
 *
 * 예약 가능한 날짜·시간(슬롯)은 DB(booking_slots)에 있고 /connectu-admin/bookings
 * 에서 등록한다. 여기에는 하드코딩하지 않는다.
 *
 * 시간은 1시간 단위(정각)이고, 모든 값은 Asia/Seoul 기준 "벽시계 시간"이다.
 *
 * ⚠️ 이 파일은 클라이언트 번들에도 들어간다. process.env 를 읽지 말 것.
 *    (하루 상한 등 서버 전용 설정은 lib/booking/slots.ts 에 둔다.)
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 슬롯 등록 시 고정으로 붙이는 연도. 붙여넣기 형식('9월 2일')에 연도가 없다. */
export const SLOT_YEAR = 2026;

/**
 * 등록된 슬롯이 하나도 없을 때 달력에 보여줄 기본 달.
 * 슬롯이 있으면 그 날짜들에서 달 목록을 만들어 쓴다.
 */
export const BOOKING_MONTHS: { year: number; month: number }[] = [
  { year: 2026, month: 9 },
  { year: 2026, month: 10 },
];

/**
 * 사업명 목록. 신청 폼의 셀렉트 값이자, 이 중 하나만 허용한다(서버 검증).
 * 관리자 화면에서 이 값으로 필터링한다.
 */
/** 상담 유형이 30분으로 고정(변경 불가)되는 사업 */
export const FIXED_30_PROJECT = "서울시 소상공인 온라인 판로개척 지원사업";

export const PROJECTS: string[] = [
  "[전남기업]무역협회 큐텐쇼츠사업",
  "[광주기업]무역협회 큐텐쇼츠사업",
  FIXED_30_PROJECT,
];

/** 유효한 사업명인지 */
export function isValidProject(name: string): boolean {
  return PROJECTS.includes(name);
}

/** 이 사업은 상담 유형이 30분으로 고정된다 */
export function isFixed30Project(name: string): boolean {
  return name === FIXED_30_PROJECT;
}

/**
 * 사업명으로 상담 유형이 자동 결정된다(사용자 선택 없음).
 * - 서울시 사업: 30분 고정
 * - 그 외(전남/광주): 60분 고정
 */
export function consultTypeForProject(name: string): "60" | "30" {
  return isFixed30Project(name) ? "30" : "60";
}

/** '01:00' → '02:00' (1시간 뒤) */
export function slotEnd(start: string): string {
  const [h, m] = start.split(":").map(Number);
  return `${pad(h + 1)}:${pad(m)}`;
}

/** '01:00' → '01:00 ~ 02:00' */
export function slotLabel(start: string): string {
  return `${start} ~ ${slotEnd(start)}`;
}

/** 화면용 'HH:MM'('01:00') → DB용 'HH:MM:SS'('01:00:00') */
export function toDbTime(start: string): string {
  return `${start}:00`;
}

/** DB용 'HH:MM:SS'('01:00:00') → 화면용 'HH:MM'('01:00') */
export function fromDbTime(time: string): string {
  return time.slice(0, 5);
}
