"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  WEEKDAY_LABELS,
  monthGrid,
  monthTitle,
  weekdayOf,
} from "@/lib/booking/calendar";
import { formatDateWithWeekday } from "@/lib/booking/format";

const BRAND = "#1B4FD8";
const POINT = "#FF6B5A";

type SlotInfo = { start: string; end: string; label: string; booked: boolean };
type Availability = {
  months: { year: number; month: number }[];
  dates: Record<string, SlotInfo[]>;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ok"; data: Availability };

type DoneInfo = { slot_date: string; time_label: string; cancel_token: string };

export default function BookingCalendar({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotInfo | null>(null);
  const [done, setDone] = useState<DoneInfo | null>(null);

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

  const slotsForSelected = useMemo<SlotInfo[]>(() => {
    if (!availability || !selectedDate) return [];
    return availability.dates[selectedDate] ?? [];
  }, [availability, selectedDate]);

  const openDateSet = useMemo(() => {
    const s = new Set<string>();
    if (availability) {
      for (const [date, slots] of Object.entries(availability.dates)) {
        if (slots.length > 0) s.add(date);
      }
    }
    return s;
  }, [availability]);

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

      {availability && (
        <>
          <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
            원하시는 <b style={{ color: BRAND }}>날짜</b>를 먼저 선택한 뒤, 시간대를
            골라 예약해 주세요.
          </p>

          <div className="space-y-8">
            {availability.months.map(({ year, month }) => (
              <MonthCalendar
                key={`${year}-${month}`}
                year={year}
                month={month}
                openDateSet={openDateSet}
                dates={availability.dates}
                selectedDate={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setActiveSlot(null);
                }}
              />
            ))}
          </div>

          {selectedDate && (
            <div className="mt-8 rounded-2xl border p-5" style={{ borderColor: "#e5e7eb" }}>
              <h3 className="text-base font-bold text-gray-800">
                {formatDateWithWeekday(selectedDate)} 시간 선택
              </h3>
              {slotsForSelected.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">예약 가능한 시간이 없습니다.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {slotsForSelected.map((slot) => (
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
          )}
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
  dates: Record<string, SlotInfo[]>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const weeks = useMemo(() => monthGrid(year, month), [year, month]);

  return (
    <div>
      <h3 className="mb-3 text-lg font-bold" style={{ color: BRAND }}>
        {monthTitle(year, month)}
      </h3>
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
          const slots = dates[date] ?? [];
          const allBooked = isOpen && slots.every((s) => s.booked);
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

// ── 신청 폼 ────────────────────────────────────────────────
function BookingForm({
  token,
  slotDate,
  slot,
  onCancel,
  onBooked,
}: {
  token: string;
  slotDate: string;
  slot: SlotInfo;
  onCancel: () => void;
  onBooked: (info: DoneInfo) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consultType, setConsultType] = useState<"60" | "30">("60");
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
          company_name: companyName,
          contact_name: contactName,
          phone,
          email,
          consult_type: consultType,
          sns_url: snsUrl,
          pre_question: preQuestion,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
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

        <Field label="상담 유형" required>
          <div className="flex gap-2">
            {(["60", "30"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setConsultType(t)}
                className="flex-1 rounded-xl border px-4 py-2.5 text-[15px] font-semibold"
                style={
                  consultType === t
                    ? { borderColor: BRAND, background: BRAND, color: "white" }
                    : { borderColor: "#d1d5db", color: "#555", background: "white" }
                }
              >
                {t}분
              </button>
            ))}
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
