import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "커넥트유 | 미디어 콘텐츠 강연·교육·컨설팅",
  description:
    "SNS 마케팅, AI 활용, 숏폼 콘텐츠 제작 전문 강사 남궁혜지. 커넥트유 대표. 640회 이상 기업·기관 강연, 만족도 4.9점.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
