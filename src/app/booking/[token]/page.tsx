import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase";
import { bookingContact } from "@/lib/booking/contact";
import { fromDbTime, slotLabel } from "@/lib/booking/config";
import { formatDateWithWeekday } from "@/lib/booking/format";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = {
  title: "예약 확인 | 커넥트유",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BRAND = "#1B4FD8";
const POINT = "#FF6B5A";

/**
 * 예약 확인 페이지 (조회 전용).
 *
 * 예약 접수 시 발급한 토큰(cancel_token)으로 자기 예약만 볼 수 있다.
 * 셀프 취소는 제공하지 않는다. 변경·취소는 담당자 연락처로 안내한다.
 */
export default async function BookingLookupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 토큰은 uuid 2개를 이어붙인 hex 64자. 형식이 다르면 조회할 것도 없다.
  if (!/^[0-9a-f]{64}$/.test(token)) notFound();

  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("cancel_token", token)
    .maybeSingle();

  if (error) {
    console.error("예약 조회 오류:", error);
    throw new Error("예약을 불러오지 못했습니다.");
  }
  if (!data) notFound();

  const booking = data as Booking;
  const start = fromDbTime(booking.start_time);
  const cancelled = Boolean(booking.cancelled_at);
  const contact = bookingContact();

  const rows: [string, string][] = [
    ["사업명", booking.project_name],
    ["기업명", booking.company_name],
    ["담당자", booking.contact_name],
    ["연락처", booking.phone],
    ["이메일", booking.email],
    ["상담 유형", booking.consult_type === "30" ? "30분" : "60분"],
  ];

  return (
    <Shell>
      <div
        className="mb-5 rounded-xl px-4 py-3 text-center"
        style={
          cancelled
            ? { background: "#f3f4f6", color: "#6b7280" }
            : { background: "#EAF0FF", color: BRAND }
        }
      >
        <p className="text-sm font-semibold">
          {cancelled ? "취소된 예약입니다" : "예약이 확정되어 있습니다"}
        </p>
        <p className="mt-1.5 text-[17px] font-bold">
          {formatDateWithWeekday(booking.slot_date)}
        </p>
        <p className="text-[17px] font-bold">{slotLabel(start)}</p>
      </div>

      <dl className="overflow-hidden rounded-xl border border-gray-200 text-[15px]">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className="flex gap-3 px-4 py-3"
            style={{ borderTop: i === 0 ? undefined : "1px solid #f1f2f4" }}
          >
            <dt className="w-20 shrink-0 font-semibold text-gray-500">{k}</dt>
            <dd className="min-w-0 flex-1 break-words text-gray-800">{v}</dd>
          </div>
        ))}
      </dl>

      {booking.pre_question && (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
          <p className="mb-1.5 text-sm font-semibold text-gray-500">
            사전 질문·고민사항
          </p>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
            {booking.pre_question}
          </p>
        </div>
      )}

      {/* 셀프 취소 없음 — 변경·취소는 담당자에게 */}
      <div
        className="mt-6 rounded-xl border px-4 py-4"
        style={{ borderColor: "#ffd9d3", background: "#FFF6F4" }}
      >
        <p className="text-[15px] font-bold" style={{ color: POINT }}>
          예약 변경·취소는 아래로 연락 주세요
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
          이 페이지에서는 예약 내용을 확인만 할 수 있습니다.
          <br />
          변경이나 취소가 필요하시면 담당자에게 알려주세요.
        </p>
        <ul className="mt-3 space-y-1.5 text-[15px] text-gray-800">
          <li>
            <span className="mr-2 text-sm font-semibold text-gray-500">담당</span>
            {contact.name}
          </li>
          {contact.phone && (
            <li>
              <span className="mr-2 text-sm font-semibold text-gray-500">전화</span>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="underline">
                {contact.phone}
              </a>
            </li>
          )}
          {contact.email && (
            <li>
              <span className="mr-2 text-sm font-semibold text-gray-500">메일</span>
              <a href={`mailto:${contact.email}`} className="underline">
                {contact.email}
              </a>
            </li>
          )}
          <li>
            <span className="mr-2 text-sm font-semibold text-gray-500">운영</span>
            {contact.hours}
          </li>
        </ul>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        이 페이지 주소는 본인 예약 확인용입니다. 외부에 공유하지 마세요.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#F7F9FC] px-4 py-8"
      style={{
        fontFamily:
          "'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      }}
    >
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6">
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ color: BRAND }}
          >
            커넥트유
          </span>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">예약 확인</h1>
        </header>
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">{children}</div>
      </div>
    </div>
  );
}
