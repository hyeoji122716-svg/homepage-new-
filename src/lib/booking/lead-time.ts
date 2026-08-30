/**
 * 예약 마감(리드타임) 계산.
 *
 * 규칙: 컨설팅 시작 시각의 N시간 전까지만 예약할 수 있다.
 *   예) 리드타임 24시간, 9/1 14:00 슬롯 → 8/31 14:00 을 넘기면 예약 불가
 *
 * ⚠️ 슬롯의 날짜/시각은 Asia/Seoul "벽시계 시간"이다(DB에도 그렇게 저장한다).
 *    서버 타임존이 UTC 여도 KST 로 판단해야 하므로, 로컬 시간대에 의존하는
 *    new Date('2026-09-01T14:00') 같은 파싱을 쓰지 않는다. KST 는 UTC+9 고정
 *    (서머타임 없음)이라 오프셋을 직접 빼서 절대시각(epoch)으로 바꾼다.
 *
 * ⚠️ 이 파일은 클라이언트 번들에도 들어갈 수 있다. process.env 를 읽지 말 것.
 *    (리드타임 값은 서버 전용 — lib/booking/slots.ts 의 bookingLeadTimeHours())
 */

/** KST 는 UTC+9 고정 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const HOUR_MS = 60 * 60 * 1000;

/**
 * KST 벽시계('2026-09-01', '14:00') → 절대시각(epoch ms).
 *
 * Date.UTC 로 "UTC 기준 그 시각"을 만든 뒤 9시간을 빼면
 * "KST 기준 그 시각"의 절대시각이 된다.
 */
export function slotStartEpochMs(date: string, start: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = start.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - KST_OFFSET_MS;
}

/** 그 슬롯의 예약 마감 시각(epoch ms). 이 시각을 넘기면 예약할 수 없다. */
export function bookingDeadlineMs(
  date: string,
  start: string,
  leadTimeHours: number
): number {
  return slotStartEpochMs(date, start) - leadTimeHours * HOUR_MS;
}

/**
 * 지금(nowMs) 기준으로 이 슬롯이 리드타임을 넘겨 마감됐는지.
 * 경계(마감 시각 정각)는 아직 예약 가능으로 본다.
 */
export function isPastLeadTime(
  date: string,
  start: string,
  leadTimeHours: number,
  nowMs: number
): boolean {
  return nowMs > bookingDeadlineMs(date, start, leadTimeHours);
}
