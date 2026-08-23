"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Booking } from "@/lib/types";
import { PROJECTS, fromDbTime, slotEnd } from "@/lib/booking/config";
import { formatDateWithWeekday } from "@/lib/booking/format";

const BRAND = "#1B4FD8";

export default function BookingAdmin({
  initialBookings,
  loadError,
}: {
  initialBookings: Booking[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("전체");

  const filtered = useMemo(() => {
    const active = initialBookings.filter((b) => !b.cancelled_at);
    if (filter === "전체") return active;
    return active.filter((b) => b.project_name === filter);
  }, [initialBookings, filter]);

  const counts = useMemo(() => {
    const active = initialBookings.filter((b) => !b.cancelled_at);
    const map: Record<string, number> = { 전체: active.length };
    for (const p of PROJECTS) {
      map[p] = active.filter((b) => b.project_name === p).length;
    }
    return map;
  }, [initialBookings]);

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
            {t === "전체" ? "전체" : shorten(t)}{" "}
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

      <p className="mb-2 text-sm text-gray-500">{filtered.length}건</p>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>예약일시</Th>
              <Th>사업명</Th>
              <Th>기업명</Th>
              <Th>담당자</Th>
              <Th>연락처</Th>
              <Th>이메일</Th>
              <Th>유형</Th>
              <Th>사전질문</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                  예약이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const start = fromDbTime(b.start_time);
                return (
                  <tr key={b.id} className="border-t border-gray-100 align-top">
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {formatDateWithWeekday(b.slot_date)}
                      <br />
                      <span className="text-gray-500">
                        {start} ~ {slotEnd(start)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{shorten(b.project_name)}</td>
                    <td className="px-3 py-2.5 font-medium">{b.company_name}</td>
                    <td className="px-3 py-2.5">{b.contact_name}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">{b.phone}</td>
                    <td className="px-3 py-2.5">{b.email}</td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {b.consult_type === "30" ? "30분" : "60분"}
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5 text-gray-600">
                      {b.pre_question || "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 사업명이 길어 표에서 대괄호 태그만 짧게 보여준다. 전체는 툴팁으로. */
function shorten(name: string): string {
  return name;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2.5 font-semibold">{children}</th>;
}
