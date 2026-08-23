/**
 * 예약 노출/오픈 설정.
 *
 * 예약 가능한 날짜·시간은 여기에 하드코딩한다. (관리자 슬롯 생성 화면 없음)
 * 시간은 1시간 단위(정각)이고, 모든 값은 Asia/Seoul 기준 "벽시계 시간"이다.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 달력에 보여줄 달 (2026년 9월, 10월). 기본 노출은 첫 번째(9월). */
export const BOOKING_MONTHS: { year: number; month: number }[] = [
  { year: 2026, month: 9 },
  { year: 2026, month: 10 },
];

/**
 * 사업명 목록. 신청 폼의 셀렉트 값이자, 이 중 하나만 허용한다(서버 검증).
 * 관리자 화면에서 이 값으로 필터링한다.
 */
export const PROJECTS: string[] = [
  "[전남기업]무역협회 큐텐쇼츠사업",
  "[광주기업]무역협회 큐텐쇼츠사업",
  "서울시 소상공인 온라인 판로개척 지원사업",
];

/** 유효한 사업명인지 */
export function isValidProject(name: string): boolean {
  return PROJECTS.includes(name);
}

/**
 * 하드코딩으로 열어둔 예약 가능 슬롯.
 * key: 'YYYY-MM-DD', value: 시작 시각('HH:MM', 정각) 배열.
 *
 * ⚠️ 지금은 시험용으로 9/1 세 칸만 열어둠. 여기 값만 바꾸면 달력에 바로 반영된다.
 */
export const OPEN_SLOTS: Record<string, string[]> = {
  "2026-09-01": ["01:00", "02:00", "03:00"],
};

/** 예약을 열어둔 날짜 목록 (슬롯이 하나 이상 있는 날) */
export function openDates(): string[] {
  return Object.keys(OPEN_SLOTS).filter((d) => OPEN_SLOTS[d]?.length > 0);
}

/** 해당 날짜의 열린 시작 시각 목록('HH:MM'). 없으면 빈 배열. */
export function openStartsFor(date: string): string[] {
  return OPEN_SLOTS[date] ?? [];
}

/** 그 (날짜, 시작시각)이 실제로 열어둔 슬롯인지 (서버 검증용) */
export function isOpenSlot(date: string, start: string): boolean {
  return openStartsFor(date).includes(start);
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
