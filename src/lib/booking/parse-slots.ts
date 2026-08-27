import { SLOT_YEAR } from "@/lib/booking/config";
import {
  WEEKDAY_LABELS,
  daysInMonth,
  weekdayOf,
  ymd,
} from "@/lib/booking/calendar";
import type { SlotParseIssue } from "@/lib/types";

/**
 * 관리자 화면에서 붙여넣는 슬롯 텍스트 파서.
 *
 * 형식:
 *   9월 2일 (수)
 *   10:00-11:00
 *   11:00-12:00
 *
 * 규칙:
 *   · 연도는 SLOT_YEAR(2026) 고정. 텍스트에 연도가 없다.
 *   · 요일 '(수)' 는 검증용이다. 실제 요일과 다르면 에러로 잡는다.
 *   · 종료 시각은 무시한다(슬롯은 1시간 고정). 다만 1시간이 아니면 에러.
 *   · 시작 시각은 정각(분=00)만 가능하다. (DB 제약과 동일)
 *
 * 에러가 하나라도 있으면 등록하지 않는다. 그래서 파싱은 중간에 멈추지 않고
 * 끝까지 훑어서 문제가 있는 줄을 전부 모아 돌려준다.
 */

/** '9월 2일 (수)' / '9월 2일' — 요일은 있으면 검증한다 */
const DATE_RE =
  /^(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*(?:[(（]\s*([일월화수목금토])\s*(?:요일)?\s*[)）])?$/;

/** '10:00-11:00' / '10:00 ~ 11:00' / '10:00' */
const TIME_RE =
  /^(\d{1,2})\s*:\s*(\d{2})(?:\s*[-~–—]\s*(\d{1,2})\s*:\s*(\d{2}))?$/;

export interface ParsedSlot {
  date: string; // 'YYYY-MM-DD'
  start: string; // 'HH:MM'
}

export interface SlotParseResult {
  slots: ParsedSlot[];
  issues: SlotParseIssue[];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function parseSlotText(text: string): SlotParseResult {
  const slots: ParsedSlot[] = [];
  const issues: SlotParseIssue[] = [];
  const seen = new Set<string>(); // 붙여넣은 텍스트 안에서의 중복 제거용

  let currentDate: string | null = null;

  const lines = text.split(/\r?\n/);

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const lineNo = idx + 1;
    if (line === "") return;

    const add = (message: string) =>
      issues.push({ line: lineNo, text: line, message });

    // ── 날짜 줄 ────────────────────────────────────────────
    const dateMatch = DATE_RE.exec(line);
    if (dateMatch) {
      const month = Number(dateMatch[1]);
      const day = Number(dateMatch[2]);
      const weekdayLabel = dateMatch[3];

      if (month < 1 || month > 12) {
        add(`${month}월은 없는 달입니다.`);
        currentDate = null;
        return;
      }
      if (day < 1 || day > daysInMonth(SLOT_YEAR, month)) {
        add(`${SLOT_YEAR}년 ${month}월에는 ${day}일이 없습니다.`);
        currentDate = null;
        return;
      }

      const date = ymd(SLOT_YEAR, month, day);
      const actual = WEEKDAY_LABELS[weekdayOf(date)];

      if (weekdayLabel && weekdayLabel !== actual) {
        add(
          `요일이 다릅니다. ${date} 는 ${actual}요일인데 (${weekdayLabel}) 로 적혀 있습니다.`
        );
      }

      // 요일이 틀려도 이후 시간 줄까지 줄줄이 에러가 나지 않도록 날짜는 잡아둔다.
      // (에러가 하나라도 있으면 어차피 등록되지 않는다.)
      currentDate = date;
      return;
    }

    // ── 시간 줄 ────────────────────────────────────────────
    const timeMatch = TIME_RE.exec(line);
    if (timeMatch) {
      if (!currentDate) {
        add("앞에 '9월 2일 (수)' 같은 날짜 줄이 필요합니다.");
        return;
      }

      const sh = Number(timeMatch[1]);
      const sm = Number(timeMatch[2]);

      if (sh > 23) {
        add(`${sh}시는 없는 시각입니다.`);
        return;
      }
      if (sm !== 0) {
        add("시작 시각은 정각만 등록할 수 있습니다. (예: 10:00)");
        return;
      }

      // 종료 시각은 저장하지 않는다(1시간 고정). 대신 1시간인지만 확인한다.
      if (timeMatch[3] !== undefined) {
        const eh = Number(timeMatch[3]);
        const em = Number(timeMatch[4]);
        if (eh !== sh + 1 || em !== sm) {
          add("슬롯은 1시간 단위만 가능합니다. (예: 10:00-11:00)");
          return;
        }
      }

      const start = `${pad(sh)}:${pad(sm)}`;
      const key = `${currentDate} ${start}`;
      if (seen.has(key)) return; // 같은 슬롯을 두 번 적은 경우는 조용히 무시
      seen.add(key);
      slots.push({ date: currentDate, start });
      return;
    }

    add("날짜('9월 2일 (수)')도 시간('10:00-11:00')도 아닙니다.");
  });

  slots.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  return { slots, issues };
}
