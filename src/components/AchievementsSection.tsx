const stats = [
  { num: "640+", label: "누적 출강 횟수", sub: "2021년 이후" },
  { num: "500+", label: "기업·기관 강의", sub: "마케팅 & 콘텐츠" },
  { num: "140+", label: "컨설팅 횟수", sub: "마케팅 전략 자문" },
  { num: "4.9", label: "강의 만족도", sub: "5점 만점 기준" },
];

const lectures = [
  {
    category: "대기업 · 금융",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    items: [
      { org: "디즈니코리아 × 초록우산어린이재단", desc: "주니어 스토리텔링 클래스 미디어 리터러시 강의" },
      { org: "NH투자증권", desc: "과장급 임원 해외연수 숏폼 특강 (4회) / 신입사원 팀빌딩 특강" },
      { org: "한국투자증권", desc: "신입사원 대상 팀빌딩 숏폼 특강" },
      { org: "미라콤아이앤씨", desc: "신입사원 대상 팀빌딩 숏폼 특강" },
    ],
  },
  {
    category: "공공기관 · 정부",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    items: [
      { org: "교육부 중앙교육연수원", desc: "9급 신규자 대상 팀빌딩 숏폼 특강 (4회)" },
      { org: "국민연금공단", desc: "서포터즈 대상 영상 / AI 콘텐츠 특강" },
      { org: "한국무역협회", desc: "글로벌 진출을 위한 SNS 마케팅 특강 (10회 이상)" },
      { org: "중소벤처기업청", desc: "글로벌 SNS 숏커머스 콘텐츠 특강 (3회 이상)" },
    ],
  },
  {
    category: "소상공인 · 창업",
    color: "bg-[#f2ffe0] border-[#d5ffaa]",
    badge: "bg-[#e6ffc2] text-[#3d6b00]",
    items: [
      { org: "경기도소상공인연합회", desc: "소상공인을 위한 SNS / AI 마케팅 특강 (30회 이상)" },
      { org: "청년도전지원사업", desc: "구직청년 대상 SNS 마케팅 / AI / 영상 제작 특강 (20회 이상)" },
      { org: "충북콘텐츠코리아랩", desc: "액셀러레이팅 사업 멘토링" },
      { org: "충남산학융합원", desc: "청년창업지원센터 멘토" },
    ],
  },
];

export default function AchievementsSection() {
  return (
    <section id="achievements" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16">
          <p className="text-[#b1ff57] text-sm font-semibold tracking-widest uppercase mb-2">Achievements</p>
          <h2 className="text-4xl font-bold text-gray-900">성과</h2>
        </div>

        {/* 핵심 수치 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="text-4xl font-bold text-[#b1ff57] mb-2">{s.num}</div>
              <div className="text-gray-900 font-semibold mb-1">{s.label}</div>
              <div className="text-gray-400 text-sm">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 강의 이력 이미지 플레이스홀더 */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-dashed border-gray-300 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            [성과 이미지 / 수료증 갤러리]<br />
            강의 현장 사진, 기관 수료증, 감사패, 협약 체결 사진 등을 그리드 형태로 배치.
            최대 6~9장 권장.
          </p>
        </div>

        {/* 카테고리별 강의 이력 */}
        <h3 className="text-2xl font-bold text-gray-900 mb-8">주요 강의 이력</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {lectures.map((group) => (
            <div key={group.category} className={`rounded-2xl border p-6 ${group.color}`}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-5 ${group.badge}`}>
                {group.category}
              </span>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={item.org}>
                    <div className="font-semibold text-gray-900 text-sm">{item.org}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 미디어 출연 / 영상 자료 플레이스홀더 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">강의 영상 · 미디어</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-gray-200 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300"
              >
                <span className="text-3xl mb-2">▶</span>
                <p className="text-gray-400 text-xs text-center px-4">
                  [강의 영상 썸네일 {i}]<br />
                  유튜브 임베드 또는 강의 영상 스크린샷.<br />
                  클릭 시 재생 연결.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
