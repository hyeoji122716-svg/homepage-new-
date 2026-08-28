"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  WEEKDAY_LABELS,
  monthGrid,
  monthTitle,
  weekdayOf,
} from "@/lib/booking/calendar";
import { formatDateWithWeekday, formatMonthDay } from "@/lib/booking/format";
import { PROJECTS, consultTypeForProject } from "@/lib/booking/config";
import type { Availability, DayAvailability, SlotInfo } from "@/lib/types";

const BRAND = "#1B4FD8";
const POINT = "#FF6B5A";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; data: Availability };

type DoneInfo = { slot_date: string; time_label: string; cancel_token: string };

export default function BookingCalendar({
  token,
  baseUrl,
}: {
  token: string;
  /** 'https://example.com' (끝에 / 없음). 못 구하면 빈 문자열 — 이때는 경로만 보여준다. */
  baseUrl: string;
}) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [monthIndex, setMonthIndex] = useState(0); // 0 = 첫 번째 달(기본 9월)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotInfo | null>(null);
  const [done, setDone] = useState<DoneInfo | null>(null);
  // 신청 도중 그 날짜가 마감된 경우 달력 위에 띄우는 안내
  const [notice, setNotice] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/booking/availability", {
        headers: { "x-booking-token": token },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        return { kind: "error" as const, message: data.error ?? "불러오지 못했습니다." };
      }
      return { kind: "ok" as const, data: data as Availability };
    } catch {
      return { kind: "error" as const, message: "서버에 연결하지 못했습니다." };
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    load().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const availability = state.kind === "ok" ? state.data : null;

  const selectedDay = useMemo<DayAvailability | null>(() => {
    if (!availability || !selectedDate) return null;
    return availability.dates[selectedDate] ?? null;
  }, [availability, selectedDate]);

  /**
   * 등록된 슬롯이 하나도 없는 경우.
   *
   * ⚠️ 이때 months 는 하드코딩 기본값(9·10월)으로 채워지기 때문에,
   *    그냥 두면 "달력은 뜨는데 날짜가 전부 비활성" 으로 보여서
   *    원인을 알 수 없다. 달력 대신 안내를 보여준다.
   */
  const hasSlots = !!availability && Object.keys(availability.dates).length > 0;

  const openDateSet = useMemo(() => {
    const s = new Set<string>();
    if (availability) {
      for (const [date, day] of Object.entries(availability.dates)) {
        if (day.slots.length > 0) s.add(date);
      }
    }
    return s;
  }, [availability]);

  /** 날짜 선택 (다른 달의 날짜를 고르면 달력도 그 달로 넘긴다) */
  const selectDate = useCallback(
    (date: string) => {
      const idx =
        availability?.months.findIndex(
          (m) =>
            m.year === Number(date.slice(0, 4)) &&
            m.month === Number(date.slice(5, 7))
        ) ?? -1;
      if (idx >= 0) setMonthIndex(idx);
      setSelectedDate(date);
      setActiveSlot(null);
      setNotice(null);
    },
    [availability]
  );

  /**
   * 신청 폼을 채우는 사이에 그 날짜가 하루 상한에 도달한 경우.
   * 폼을 닫고 달력으로 돌아가서, 다른 날짜를 고를 수 있게 달력으로 스크롤한다.
   */
  function handleDayFull(message: string) {
    setActiveSlot(null);
    setNotice(message);
    load().then((result) => setState(result));
  }

  // 안내가 새로 뜨면 달력으로 데려간다. (다른 날짜를 바로 고를 수 있게)
  useEffect(() => {
    if (!notice) return;
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [notice]);

  function handleBooked(info: DoneInfo) {
    setDone(info);
    setActiveSlot(null);
    // 마감 상태 갱신
    load().then((result) => setState(result));
  }

  // ── 완료 화면 ────────────────────────────────────────────
  if (done) {
    return (
      <Shell>
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ borderColor: "#e5e7eb" }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ background: "#EAF0FF", color: BRAND }}
          >
            ✓
          </div>
          <h2 className="text-xl font-bold" style={{ color: BRAND }}>
            예약이 완료되었습니다
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
            <b>{formatDateWithWeekday(done.slot_date)}</b>
            <br />
            <b>{done.time_label}</b> 에 예약되었습니다.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            담당자가 확인 후 안내드립니다. 창을 닫으셔도 됩니다.
          </p>

          {/* 조회 전용 링크. 이 주소로 예약 내용을 다시 확인할 수 있다.
              변경·취소는 이 페이지에 안내된 담당자 연락처로 받는다. */}
          <CopyLinkBox url={`${baseUrl}/booking/${done.cancel_token}`} />

          <button
            onClick={() => {
              setDone(null);
              setSelectedDate(null);
            }}
            className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: BRAND }}
          >
            다른 시간 예약하기
          </button>
        </div>
      </Shell>
    );
  }

  // ── 신청 폼 ──────────────────────────────────────────────
  if (activeSlot && selectedDate) {
    return (
      <Shell>
        <BookingForm
          token={token}
          slotDate={selectedDate}
          slot={activeSlot}
          onCancel={() => setActiveSlot(null)}
          onBooked={handleBooked}
          onDayFull={handleDayFull}
        />
      </Shell>
    );
  }

  // ── 달력 + 슬롯 선택 ─────────────────────────────────────
  return (
    <Shell>
      {state.kind === "loading" && (
        <p className="py-16 text-center text-sm text-gray-500">불러오는 중…</p>
      )}
      {state.kind === "error" && (
        <p className="py-16 text-center text-sm" style={{ color: POINT }}>
          {state.message}
        </p>
      )}

      {availability && !hasSlots && (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ borderColor: "#e5e7eb", background: "#fafafa" }}
        >
          <p className="text-[15px] font-semibold text-gray-700">
            아직 열린 예약 시간이 없습니다
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            예약 가능한 날짜가 등록되면 이 화면에서 바로 선택할 수 있습니다.
            <br />
            담당자에게 문의해 주세요.
          </p>
        </div>
      )}

      {availability && hasSlots && (
        <>
          <p className="mb-3 text-[15px] leading-relaxed text-gray-600">
            원하시는 <b style={{ color: BRAND }}>날짜</b>를 먼저 선택한 뒤, 시간대를
            골라 예약해 주세요.
          </p>

          <p
            className="mb-6 rounded-xl px-4 py-2.5 text-[13px] leading-relaxed"
            style={{ background: "#EAF0FF", color: BRAND }}
          >
            컨설팅 품질을 위해 하루 예약 건수를 제한하고 있습니다.
          </p>

          {notice && (
            <p
              className="mb-6 rounded-xl px-4 py-3 text-sm font-semibold leading-relaxed"
              style={{ background: "#FFF0EE", color: POINT }}
            >
              {notice}
            </p>
          )}

          {(() => {
            const months = availability.months;
            const safeIndex = Math.min(monthIndex, months.length - 1);
            const current = months[safeIndex];
            return (
              <div ref={calendarRef}>
                <div className="mb-3 flex items-center justify-between">
                  <ArrowButton
                    dir="prev"
                    disabled={safeIndex === 0}
                    onClick={() => {
                      setMonthIndex(safeIndex - 1);
                      setSelectedDate(null);
                    }}
                  />
                  <h3 className="text-lg font-bold" style={{ color: BRAND }}>
                    {monthTitle(current.year, current.month)}
                  </h3>
                  <ArrowButton
                    dir="next"
                    disabled={safeIndex === months.length - 1}
                    onClick={() => {
                      setMonthIndex(safeIndex + 1);
                      setSelectedDate(null);
                    }}
                  />
                </div>
                <MonthCalendar
                  year={current.year}
                  month={current.month}
                  openDateSet={openDateSet}
                  dates={availability.dates}
                  selectedDate={selectedDate}
                  onSelect={selectDate}
                />
              </div>
            );
          })()}

          {selectedDate &&
            selectedDay &&
            /* 하루 상한이 찬 날은 시간대를 하나씩 보여주지 않고 카드째 접는다. */
            (selectedDay.full ? (
              <div
                className="mt-6 rounded-2xl border p-5 text-center"
                style={{ borderColor: "#eee", background: "#fafafa" }}
              >
                <span
                  className="inline-block rounded-full px-4 py-2 text-sm font-bold"
                  style={{ background: "#FFF0EE", color: POINT }}
                >
                  {formatMonthDay(selectedDate)} · 예약 마감
                </span>
              </div>
            ) : (
              <div
                className="mt-6 rounded-2xl border p-5"
                style={{ borderColor: "#e5e7eb" }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-800">
                    {formatDateWithWeekday(selectedDate)} 시간 선택
                  </h3>
                  <span className="text-sm text-gray-500">
                    예약 {selectedDay.booked}/{selectedDay.limit}
                  </span>
                </div>

                {selectedDay.slots.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">
                    예약 가능한 시간이 없습니다.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {selectedDay.slots.map((slot) => (
                      <button
                        key={slot.start}
                        disabled={slot.booked}
                        onClick={() => setActiveSlot(slot)}
                        className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[15px] transition-colors disabled:cursor-not-allowed"
                        style={
                          slot.booked
                            ? { borderColor: "#eee", background: "#f6f6f6", color: "#aaa" }
                            : { borderColor: BRAND, color: BRAND, background: "white" }
                        }
                      >
                        <span className="font-semibold">{slot.label}</span>
                        <span className="text-sm">{slot.booked ? "마감" : "예약"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </>
      )}
    </Shell>
  );
}

// ── 달력 한 달 ─────────────────────────────────────────────
function MonthCalendar({
  year,
  month,
  openDateSet,
  dates,
  selectedDate,
  onSelect,
}: {
  year: number;
  month: number;
  openDateSet: Set<string>;
  dates: Record<string, DayAvailability>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const weeks = useMemo(() => monthGrid(year, month), [year, month]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={w} className="py-1" style={{ color: i === 0 ? POINT : undefined }}>
            {w}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeks.flat().map((date, idx) => {
          if (!date) return <div key={idx} />;
          const day = Number(date.slice(-2));
          const isOpen = openDateSet.has(date);
          const info = dates[date];
          // 하루 상한에 도달했거나 남은 슬롯이 없으면 마감으로 보여준다.
          const allBooked =
            isOpen && (info.full || info.slots.every((s) => s.booked));
          const isSelected = date === selectedDate;
          const dow = weekdayOf(date);

          return (
            <button
              key={date}
              disabled={!isOpen}
              onClick={() => onSelect(date)}
              className="aspect-square rounded-lg text-sm transition-colors disabled:cursor-default"
              style={
                isSelected
                  ? { background: BRAND, color: "white", fontWeight: 700 }
                  : isOpen && !allBooked
                    ? { border: `1.5px solid ${BRAND}`, color: BRAND, fontWeight: 600, background: "white" }
                    : allBooked
                      ? { background: "#f3f4f6", color: "#bbb", textDecoration: "line-through" }
                      : { color: dow === 0 ? "#f0a99f" : "#cbd0d6", background: "transparent" }
              }
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "이전 달" : "다음 달"}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-colors disabled:opacity-30"
      style={{ borderColor: "#d1d5db", color: BRAND }}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

// ── 신청 폼 ────────────────────────────────────────────────
function BookingForm({
  token,
  slotDate,
  slot,
  onCancel,
  onBooked,
  onDayFull,
}: {
  token: string;
  slotDate: string;
  slot: SlotInfo;
  onCancel: () => void;
  onBooked: (info: DoneInfo) => void;
  /** 폼을 채우는 사이 그 날짜가 하루 상한에 도달한 경우(BK003) */
  onDayFull: (message: string) => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [snsUrl, setSnsUrl] = useState("");
  const [preQuestion, setPreQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-booking-token": token },
        body: JSON.stringify({
          slot_date: slotDate,
          start_time: slot.start,
          project_name: projectName,
          company_name: companyName,
          contact_name: contactName,
          phone,
          email,
          sns_url: snsUrl,
          pre_question: preQuestion,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // BK003 = 하루 상한. 이 시간만의 문제가 아니라 그날 전체가 닫힌 것이므로
        // 폼 안에 에러를 띄우지 않고 달력으로 돌려보낸다.
        if (data.code === "BK003") {
          onDayFull("해당 날짜가 방금 마감되었습니다. 다른 날짜를 선택해 주세요.");
          return;
        }
        setError(data.error ?? "예약에 실패했습니다.");
        return;
      }
      onBooked({
        slot_date: data.slot_date,
        time_label: data.time_label,
        cancel_token: data.cancel_token,
      });
    } catch {
      setError("서버에 연결하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-[15px] outline-none focus:border-[#1B4FD8]";

  return (
    <div>
      <button onClick={onCancel} className="mb-4 text-sm text-gray-500">
        ← 시간 다시 선택
      </button>

      <div
        className="mb-5 rounded-xl px-4 py-3 text-[15px] font-semibold"
        style={{ background: "#EAF0FF", color: BRAND }}
      >
        {formatDateWithWeekday(slotDate)} · {slot.label}
      </div>

      <p className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-[13px] leading-relaxed text-gray-500">
        예약은 1시간 단위로 진행됩니다. 30분 컨설팅으로 신청하신 경우 해당 시간 내에서
        30분간 진행됩니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="사업명" required>
          <select
            className={`${inputCls} bg-white`}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          >
            <option value="" disabled>
              사업명을 선택하세요
            </option>
            {PROJECTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="기업명" required>
          <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </Field>
        <Field label="담당자명" required>
          <input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        </Field>
        <Field label="연락처" required>
          <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" required />
        </Field>
        <Field label="이메일" required>
          <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>

        <Field label="상담 유형">
          <div
            className="rounded-xl border px-4 py-2.5 text-[15px] font-semibold"
            style={{ borderColor: "#e5e7eb", background: "#f6f7f9", color: "#555" }}
          >
            {projectName
              ? `${consultTypeForProject(projectName)}분 (사업명에 따라 자동 지정)`
              : "사업명을 선택하면 자동으로 정해집니다"}
          </div>
        </Field>

        <Field label="SNS 계정 URL">
          <input className={inputCls} value={snsUrl} onChange={(e) => setSnsUrl(e.target.value)} placeholder="선택" />
        </Field>
        <Field label="사전 질문·고민사항">
          <textarea className={`${inputCls} min-h-[96px]`} value={preQuestion} onChange={(e) => setPreQuestion(e.target.value)} placeholder="선택" />
        </Field>

        {error && (
          <p className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "#FFF0EE", color: POINT }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
          style={{ background: BRAND }}
        >
          {pending ? "접수 중…" : "예약 신청"}
        </button>
      </form>
    </div>
  );
}

/**
 * 예약 확인 주소 + 복사 버튼.
 *
 * 도메인까지 붙은 전체 주소를 보여준다. 사용자가 이 주소를 복사해서
 * 메모장·메신저에 붙여넣어야 하는데, 경로만 있으면 그대로는 못 연다.
 */
function CopyLinkBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API 가 막힌 환경(비-https 등) 대비 폴백
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3.5 text-left">
      <p className="text-sm font-semibold text-gray-600">
        예약 확인 주소 (저장해 두세요)
      </p>
      <a
        href={url}
        className="mt-1.5 block break-all text-sm underline"
        style={{ color: BRAND }}
      >
        {url}
      </a>
      <button
        type="button"
        onClick={copy}
        className="mt-2.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors"
        style={
          copied
            ? { borderColor: BRAND, background: BRAND, color: "white" }
            : { borderColor: BRAND, color: BRAND, background: "white" }
        }
      >
        {copied ? "복사됨 ✓" : "주소 복사"}
      </button>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
        예약 변경·취소는 이 페이지에 안내된 연락처로 알려주세요.
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span style={{ color: POINT }}> *</span>}
      </span>
      {children}
    </label>
  );
}

// ── 공통 레이아웃(브랜드/폰트) ─────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#F7F9FC] px-4 py-8"
      style={{
        fontFamily:
          "'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      }}
    >
      {/* Pretendard (CDN) */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6">
          <span className="text-lg font-extrabold tracking-tight" style={{ color: BRAND }}>
            커넥트유
          </span>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">컨설팅 예약</h1>
        </header>
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">{children}</div>
      </div>
    </div>
  );
}
