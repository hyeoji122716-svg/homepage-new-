"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const fragmentItems = [
  { label: "소개", href: "#about" },
  { label: "성과", href: "#achievements" },
  { label: "포트폴리오", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleFragmentClick = (href: string) => {
    setMenuOpen(false);
    setActive(href);
    if (pathname === "/") {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/" + href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 hover:opacity-80 transition-opacity"
        >
          CONNECT<span className="text-[#b1ff57]">U</span>
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-7">
          {fragmentItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleFragmentClick(item.href)}
              className={`text-sm font-medium transition-colors hover:text-[#b1ff57] ${
                active === item.href ? "text-[#b1ff57]" : "text-gray-500"
              }`}
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/instructor"
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-all ${
              pathname === "/instructor"
                ? "border-[#b1ff57] text-[#3d6b00] bg-[#b1ff57]"
                : "border-gray-200 text-gray-500 hover:border-[#b1ff57] hover:text-[#b1ff57]"
            }`}
          >
            강사 소개
          </Link>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          {fragmentItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleFragmentClick(item.href)}
              className="block w-full text-left px-6 py-4 text-gray-600 hover:text-[#b1ff57] hover:bg-[#f2ffe0] text-sm font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
          <Link
            href="/instructor"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-4 text-gray-600 hover:text-[#b1ff57] hover:bg-[#f2ffe0] text-sm font-medium transition-colors border-t border-gray-100"
          >
            강사 소개
          </Link>
        </div>
      )}
    </header>
  );
}
