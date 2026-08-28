import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { bookingAccessToken } from "@/lib/booking/access";
import { siteUrl } from "@/lib/site-url";
import BookingCalendar from "@/components/booking/BookingCalendar";

export const metadata: Metadata = {
  title: "컨설팅 예약 | 커넥트유",
  // 비밀 URL 이므로 검색엔진에 잡히지 않게 한다.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReservePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const expected = bookingAccessToken();

  // 토큰 미설정이거나 불일치면 404 (페이지 자체를 숨긴다)
  if (!expected || token !== expected) {
    notFound();
  }

  // 완료 화면의 "예약 확인 주소"를 도메인까지 붙여 보여주기 위해 내려준다.
  return <BookingCalendar token={token} baseUrl={await siteUrl()} />;
}
