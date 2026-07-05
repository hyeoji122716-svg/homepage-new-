export default function Footer() {
  return (
    <footer className="bg-black text-gray-500 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <span className="text-white font-bold tracking-tight">
            CONNECT<span className="text-[#b1ff57]">U</span>
          </span>
          <span className="ml-3">© {new Date().getFullYear()} 커넥트유. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>콘텐츠 마케팅 · 강연 · 미디어 제작 · 컨설팅</span>
          <a
            href="/privacy"
            className="text-gray-400 hover:text-[#b1ff57] underline transition-colors"
          >
            개인정보처리방침
          </a>
        </div>
      </div>
    </footer>
  );
}
