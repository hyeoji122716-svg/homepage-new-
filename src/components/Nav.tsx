"use client";

import { useState, useEffect } from "react";

const navItems = [
  { label: "소개", href: "#about" },
  { label: "성과", href: "#achievements" },
  { label: "포트폴리오", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMenuOpen(false);
    setActive(href);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <button
          onClick={() => handleClick("#hero")}
          className={`text-xl font-bold tracking-tight transition-colors ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
        >
          CONNECT<span className="text-[#b1ff57]">U</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className={`text-sm font-medium transition-colors hover:text-[#b1ff57] ${
                active === item.href
                  ? "text-[#b1ff57]"
                  : scrolled
                  ? "text-gray-700"
                  : "text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden flex flex-col gap-1.5 p-1 ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className="block w-full text-left px-6 py-4 text-gray-700 hover:text-[#b1ff57] hover:bg-[#f2ffe0] font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
