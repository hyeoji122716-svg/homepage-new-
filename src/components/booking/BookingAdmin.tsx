"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Booking, SlotRegisterResult } from "@/lib/types";
import { PROJECTS, fromDbTime, slotEnd } from "@/lib/booking/config";
import { formatDateWithWeekday } from "@/lib/booking/format";

const BRAND = "#1B4FD8";
const POINT = "#FF6B5A";

export default function BookingAdmin({
  initialBookings,
  loadError,
  dailyLimit,
  openSlotCount,
}: {
  initialBookings: Booking[];
  loadError: string | null;
  dailyLimit: number;
  openSlotCount: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("전체");
  const [showCancelled, setShowCancelled] = useState(false);
  const [confirming, setConfirming] = useState<Booking | null>(null);

  const visible = useMemo(() => {
    let rows = initialBookings;
    if (!showCancelled) rows = rows.filter((b) => !b.cancelled_at);
    if (filter !== "전체") rows = rows.filter((b) => b.project_name === filter);
    return rows;
  }, [initialBookings, filter, showCancelled]);

  const counts = useMemo(() => {
    const active = initialBookings.filter((b) => !b.cancelled_at);
    const map: Record<string, number> = { 전체: active.length };
    for (const p of PROJECTS) {
      map[p] = active.filter((b) => b.project_name === p).length;
    }
    return map;
  }, [initialBookings]);

  /**
   * 날짜별 유효 예약 수. 필터와 무관하게 항상 "전체 기준"이어야 한다.
   * (하루 상한은 사업명과 상관없이 그 날짜 전체에 걸리므로)
   */
  const bookedPerDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of initialBookings) {
      if (b.cancelled_at) continue;
      map[b.slot_date] = (map[b.slot_date] ?? 0) + 1;
    }
    return map;
  }, [initialBookings]);

  /** 보이는 예약을 날짜별로 묶는다 (서버에서 날짜·시각 순으로 정렬해 온다) */
  const groups = useMemo(() => {
    const out: { date: string; rows: Booking[] }[] = [];
    for (const b of visible) {
      const last = out[out.length - 1];
      if (last && last.date === b.slot_date) last.rows.push(b);
      else out.push({ date: b.slot_date, rows: [b] });
    }
    return out;
  }, [visible]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const tabs = ["전체", ...PROJECTS];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: BRAND }}>
            예약 관리
          </h1>
          <a href="/connectu-admin" className="text-sm text-gray-500 underline">
            ← 문의 관리로
          </a>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 underline">
          로그아웃
        </button>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          불러오기 오류: {loadError}
        </p>
      )}

      <SlotRegister openSlotCount={openSlotCount} onRegistered={() => router.refresh()} />

      {/* 사업명 필터 + 엑셀 다운로드 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="rounded-full border px-3.5 py-1.5 text-sm transition-colors"
            style={
              filter === t
                ? { borderColor: BRAND, background: BRAND, color: "white" }
                : { borderColor: "#d1d5db", color: "#444", background: "white" }
            }
          >
            {t === "전체" ? "전체" : t}{" "}
            <span className="opacity-70">({counts[t] ?? 0})</span>
          </button>
        ))}
        <a
          href="/api/admin/bookings/export"
          className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "#1a7f4b" }}
        >
          ⬇ 엑셀 전체 다운로드
        </a>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">{visible.length}건</p>
        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={(e) => setShowCancelled(e.target.checked)}
          />
          취소된 예약도 보기
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>시간</Th>
              <Th>사업명</Th>
              <Th>기업명</Th>
              <Th>담당자</Th>
              <Th>연락처</Th>
              <Th>이메일</Th>
              <Th>유형</Th>
              <Th>사전질문</Th>
              <Th>관리</Th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  예약이 없습니다.
                </td>
              </tr>
            ) : (
              groups.map((g) => {
                const booked = bookedPerDate[g.date] ?? 0;
                const full = booked >= dailyLimit;
                return (
                  <DateGroup
                    key={g.date}
                    date={g.date}
                    booked={booked}
                    limit={dailyLimit}
                    full={full}
                    rows={g.rows}
                    onCancel={setConfirming}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirming && (
        <CancelDialog
          booking={confirming}
          onClose={() => setConfirming(null)}
          onDone={() => {
            setConfirming(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ── 날짜 묶음 (헤더 + 그 날짜 예약들) ───────────────────────
function DateGroup({
  date,
  booked,
  limit,
  full,
  rows,
  onCancel,
}: {
  date: string;
  booked: number;
  limit: number;
  full: boolean;
  rows: Booking[];
  onCancel: (b: Booking) => void;
}) {
  return (
    <>
      <tr className="border-t border-gray-200 bg-gray-50/80">
        <td colSpan={9} className="px-3 py-2">
          <span className="font-bold text-gray-800">
            {formatDateWithWeekday(date)}
          </span>
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={
              full
                ? { background: "#FFF0EE", color: POINT }
                : { background: "#EAF0FF", color: BRAND }
            }
          >
            예약 {booked}/{limit}
            {full && " · 마감"}
          </span>
        </td>
      </tr>

      {rows.map((b) => {
        const start = fromDbTime(b.start_time);
        const cancelled = Boolean(b.cancelled_at);
        return (
          <tr
            key={b.id}
            className="border-t border-gray-100 align-top"
            style={cancelled ? { background: "#fafafa", color: "#9ca3af" } : undefined}
          >
            <td className="whitespace-nowrap px-3 py-2.5">
              {start} ~ {slotEnd(start)}
              {cancelled && (
                <span className="ml-1.5 text-xs font-semibold" style={{ color: POINT }}>
                  취소됨
                </span>
              )}
            </td>
            <td className="px-3 py-2.5">{b.project_name}</td>
            <td className="px-3 py-2.5 font-medium">{b.company_name}</td>
            <td className="px-3 py-2.5">{b.contact_name}</td>
            <td className="whitespace-nowrap px-3 py-2.5">{b.phone}</td>
            <td className="px-3 py-2.5">{b.email}</td>
            <td className="whitespace-nowrap px-3 py-2.5">
              {b.consult_type === "30" ? "30분" : "60분"}
            </td>
            <td className="max-w-[240px] px-3 py-2.5">{b.pre_question || "-"}</td>
            <td className="whitespace-nowrap px-3 py-2.5">
              {cancelled ? (
                <span className="text-xs text-gray-400">-</span>
              ) : (
                <button
                  onClick={() => onCancel(b)}
                  className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                  style={{ borderColor: POINT, color: POINT }}
                >
                  취소
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

// ── 취소 확인 모달 ─────────────────────────────────────────
function CancelDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking;
  onClose: () => void;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = fromDbTime(booking.start_time);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "취소하지 못했습니다.");
        return;
      }
      onDone();
    } catch {
      setError("서버에 연결하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">이 예약을 취소할까요?</h2>
        <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
          <b>{formatDateWithWeekday(booking.slot_date)}</b>
          <br />
          {start} ~ {slotEnd(start)}
          <br />
          {booking.company_name} · {booking.contact_name}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
          취소하면 이 슬롯은 곧바로 다시 예약 가능해집니다. 고객사에는 자동으로
          알려지지 않으니 따로 안내해 주세요.
        </p>

        {error && (
          <p
            className="mt-3 rounded-lg px-3 py-2 text-sm"
            style={{ background: "#FFF0EE", color: POINT }}
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-600"
          >
            닫기
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: POINT }}
          >
            {pending ? "취소 중…" : "예약 취소"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 슬롯 등록 (텍스트 붙여넣기) ─────────────────────────────
const SAMPLE = `9월 2일 (수)
10:00-11:00
11:00-12:00`;

function SlotRegister({
  openSlotCount,
  onRegistered,
}: {
  openSlotCount: number;
  onRegistered: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<SlotRegisterResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function send(commit: boolean) {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, commit }),
      });
      const data = (await res.json()) as SlotRegisterResult & { error?: string };
      setPreview(data.items ? data : null);
      if (!res.ok) {
        setError(data.error ?? "처리하지 못했습니다.");
        return;
      }
      if (commit && data.registered) {
        setMessage(`${data.newCount}개 등록했습니다. (중복 ${data.dupCount}개 건너뜀)`);
        setText("");
        setPreview(null);
        onRegistered();
      }
    } catch {
      setError("서버에 연결하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  const hasIssues = (preview?.issues.length ?? 0) > 0;

  return (
    <div className="mb-5 rounded-xl border border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-gray-800">
          예약 슬롯 등록{" "}
          <span className="ml-1 font-normal text-gray-500">
            (현재 {openSlotCount}칸 열림)
          </span>
        </span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4">
          <p className="mb-2 text-[13px] leading-relaxed text-gray-500">
            아래 형식으로 붙여넣으세요. 연도는 2026년 고정이고, 슬롯은 1시간 단위입니다.
            요일은 검증용이라 실제 요일과 다르면 오류로 알려줍니다.
          </p>
          <pre className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-[13px] text-gray-600">
            {SAMPLE}
          </pre>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
              setMessage(null);
            }}
            placeholder={SAMPLE}
            className="min-h-[160px] w-full rounded-xl border border-gray-300 px-3.5 py-2.5 font-mono text-[13px] outline-none focus:border-[#1B4FD8]"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => send(false)}
              disabled={pending || text.trim() === ""}
              className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              {pending ? "확인 중…" : "미리보기"}
            </button>
            <button
              onClick={() => send(true)}
              disabled={pending || !preview || hasIssues || preview.newCount === 0}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              style={{ background: BRAND }}
            >
              등록하기
            </button>
            {preview && !hasIssues && (
              <span className="text-sm text-gray-600">
                <b style={{ color: BRAND }}>{preview.newCount}개 등록</b> / 중복{" "}
                {preview.dupCount}개
              </span>
            )}
          </div>

          {message && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </p>
          )}
          {error && (
            <p
              className="mt-3 rounded-lg px-3 py-2 text-sm"
              style={{ background: "#FFF0EE", color: POINT }}
            >
              {error}
            </p>
          )}

          {hasIssues && preview && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="mb-1.5 text-sm font-bold text-red-700">
                형식 오류 {preview.issues.length}건 — 고친 뒤 다시 미리보기 하세요.
              </p>
              <ul className="space-y-1 text-[13px] text-red-700">
                {preview.issues.map((issue, i) => (
                  <li key={i}>
                    <b>{issue.line}줄</b> “{issue.text}” — {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview && !hasIssues && preview.items.length > 0 && (
            <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-[13px]">
                <tbody>
                  {preview.items.map((it) => (
                    <tr key={`${it.date} ${it.start}`} className="border-b border-gray-100">
                      <td className="px-3 py-1.5">{formatDateWithWeekday(it.date)}</td>
                      <td className="px-3 py-1.5">
                        {it.start} ~ {slotEnd(it.start)}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {it.duplicate ? (
                          <span className="text-gray-400">이미 있음</span>
                        ) : (
                          <span style={{ color: BRAND }}>등록</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2.5 font-semibold">{children}</th>;
}
