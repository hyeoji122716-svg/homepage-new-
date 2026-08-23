import { WEEKDAY_LABELS, weekdayOf } from "@/lib/booking/calendar";

/** '2026-09-01' → '2026-09-01 (화)' */
export function formatDateWithWeekday(date: string): string {
  return `${date} (${WEEKDAY_LABELS[weekdayOf(date)]})`;
}
