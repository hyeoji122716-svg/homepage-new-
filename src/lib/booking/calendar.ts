/**
 * 달력 그리드 유틸.
 *
 * 모든 날짜는 Asia/Seoul 기준의 "벽시계" 날짜다. 서버 타임존에 영향받지 않도록
 * Date 는 UTC 메서드(Date.UTC / getUTC*)로만 다룬다.
 */

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** (year, month=1~12, day) → 'YYYY-MM-DD' */
export function ymd(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** 그 달의 일수 (month = 1~12) */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 그 달 1일의 요일 (0=일 … 6=토) */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

/** 'YYYY-MM-DD' 의 요일 (0=일 … 6=토) */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * 한 달을 주(week) 단위 2차원 배열로 만든다.
 * 각 칸은 'YYYY-MM-DD' 문자열이거나, 앞뒤 빈칸이면 null.
 */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const total = daysInMonth(year, month);
  const lead = firstWeekdayOfMonth(year, month);

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(ymd(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** '2026-09' 같은 라벨용: '2026년 9월' */
export function monthTitle(year: number, month: number): string {
  return `${year}년 ${month}월`;
}
