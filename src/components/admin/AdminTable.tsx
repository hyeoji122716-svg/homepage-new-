"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Inquiry,
  type InquiryStatus,
  INQUIRY_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/types";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-[#b1ff57] text-gray-900",
  in_progress: "bg-yellow-200 text-yellow-900",
  done: "bg-gray-200 text-gray-600",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminTable({
  initialInquiries,
  loadError,
}: {
  initialInquiries: Inquiry[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [busyId, setBusyId] = useState<string | null>(null);

  const newCount = inquiries.filter((i) => i.status === "new").length;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    setBusyId(id);
    const prev = inquiries;
    setInquiries((list) =>
      list.map((i) => (i.id === id ? { ...i, status } : i))
    );
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setInquiries(prev);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              CONNECT<span className="text-[#8fd63a]">U</span>
            </span>
            <span className="text-sm text-gray-400">문의 관리</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 요약 */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">전체 문의</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-2xl font-bold text-[#7bc02f]">{newCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">신규</div>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            데이터를 불러오지 못했습니다: {loadError}
            <br />
            <span className="text-red-500">
              Supabase 환경변수 설정과 테이블 생성(supabase/schema.sql) 여부를
              확인하세요.
            </span>
          </div>
        )}

        {!loadError && inquiries.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center text-gray-400">
            아직 접수된 문의가 없습니다.
          </div>
        )}

        {inquiries.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">접수일</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">이름</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">소속</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">연락처</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">유형</th>
                  <th className="px-4 py-3 font-medium min-w-[240px]">문의 내용</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">상태</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 last:border-0 align-top hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {item.org || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      <a
                        href={`mailto:${item.email}`}
                        className="text-[#7bc02f] hover:underline"
                      >
                        {item.email}
                      </a>
                      {item.phone && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {item.type ? INQUIRY_TYPE_LABELS[item.type] ?? item.type : "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-700 max-w-md whitespace-pre-wrap break-words">
                      {item.message}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as InquiryStatus
                          )
                        }
                        className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLES[item.status]}`}
                      >
                        {(Object.keys(STATUS_LABELS) as InquiryStatus[]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
