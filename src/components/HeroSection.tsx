"use client";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900"
    >
      {/* 배경 이미지 플레이스홀더 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a3300]/40">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <p className="text-white text-center text-sm px-8 leading-relaxed max-w-md">
            [배경 이미지] 강연 현장 전경 사진 — 강사가 무대 위에서 발표하는 역동적인 장면,
            또는 청중이 집중하는 대형 강연장 전경. 어두운 톤 오버레이 적용.
          </p>
        </div>
      </div>

      {/* 오렌지 accent 라인 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#b1ff57] to-transparent" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[#b1ff57] text-sm font-semibold tracking-widest uppercase mb-4">
          Media Content · Lecture · Consulting
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          콘텐츠로 세상과<br />
          <span className="text-[#b1ff57]">연결</span>합니다
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          SNS 마케팅 · 미디어 콘텐츠 · 숏폼 · AI 활용<br />
          기업과 기관이 먼저 찾는 강사, 남궁혜지
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-[#b1ff57] hover:bg-[#9ce040] text-gray-900 font-semibold rounded-full transition-all shadow-lg hover:shadow-[#b1ff57]/30 hover:scale-105"
          >
            강의 문의하기
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 border border-white/30 hover:border-[#b1ff57] text-white hover:text-[#b1ff57] font-semibold rounded-full transition-all"
          >
            프로필 보기
          </a>
        </div>

        {/* 핵심 수치 */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { num: "640+", label: "출강 횟수" },
            { num: "4.9", label: "평균 만족도" },
            { num: "8년", label: "강의 경력" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#b1ff57]">{stat.num}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 유도 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
