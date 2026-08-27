import { WEEKDAY_LABELS, weekdayOf } from "@/lib/booking/calendar";

/** '2026-09-01' → '2026-09-01 (화)' */
export function formatDateWithWeekday(date: string): string {
  return `${date} (${WEEKDAY_LABELS[weekdayOf(date)]})`;
}

/** '2026-09-21' → '9월 21일' */
export function formatMonthDay(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}월 ${d}일`;
}

/** '2026-09-21' → '9월 21일 (월)' */
export function formatMonthDayWithWeekday(date: string): string {
  return `${formatMonthDay(date)} (${WEEKDAY_LABELS[weekdayOf(date)]})`;
}
