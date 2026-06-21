const clients = [
  {
    category: "대기업 · 금융 · 증권",
    companies: [
      "디즈니코리아",
      "NH투자증권",
      "한국투자증권",
      "미라콤아이앤씨",
    ],
  },
  {
    category: "공공기관 · 정부부처",
    companies: [
      "교육부 중앙교육연수원",
      "국민연금공단",
      "한국무역협회",
      "중소벤처기업청",
      "문화체육관광부",
      "국민체육진흥공단",
      "한국체육대학교",
      "전라남도 통상닥터제",
    ],
  },
  {
    category: "소상공인 · 스타트업 · 창업지원",
    companies: [
      "경기도소상공인연합회",
      "청년도전지원사업",
      "충북콘텐츠코리아랩",
      "충남산학융합원 청년창업지원센터",
      "(주)트레이드스쿨",
    ],
  },
  {
    category: "비영리 · 사회공헌",
    companies: [
      "초록우산어린이재단",
    ],
  },
];

const services = [
  {
    icon: "🎤",
    title: "기업 강연",
    desc: "신입사원 교육, 임원 연수, 팀빌딩 등 기업 맞춤형 미디어·마케팅 특강. 1회성 특강부터 시리즈 강의까지.",
    tags: ["숏폼 특강", "SNS 마케팅", "팀빌딩"],
  },
  {
    icon: "📚",
    title: "교육 운영",
    desc: "공공기관 및 지자체 교육사업 운영. 소상공인·청년 대상 SNS·AI·영상 제작 과정 기획 및 강의.",
    tags: ["교육과정 설계", "AI 활용", "영상 제작"],
  },
  {
    icon: "💡",
    title: "마케팅 컨설팅",
    desc: "브랜드 SNS 채널 전략, 콘텐츠 기획, 글로벌 마케팅 자문. 현장 경험 기반의 실질적인 솔루션 제공.",
    tags: ["SNS 전략", "글로벌 마케팅", "브랜드 컨설팅"],
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16">
          <p className="text-[#b1ff57] text-sm font-semibold tracking-widest uppercase mb-2">Portfolio</p>
          <h2 className="text-4xl font-bold text-gray-900">함께한 기업·기관</h2>
        </div>

        {/* 서비스 영역 */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {services.map((s) => (
            <div
              key={s.title}
              className="group bg-gray-50 hover:bg-[#b1ff57] rounded-2xl p-8 transition-all duration-300 cursor-default"
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-900 mb-3 transition-colors">
                {s.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 text-sm leading-relaxed mb-4 transition-colors">
                {s.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-white group-hover:bg-[#3d6b00] text-gray-600 group-hover:text-white rounded-full transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 로고 그리드 플레이스홀더 */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">클라이언트</h3>
          <p className="text-gray-500 text-sm mb-8">
            강의 및 컨설팅을 진행한 주요 기업·기관입니다.
          </p>

          {/* 로고 이미지 영역 */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-dashed border-gray-300 text-center">
            <p className="text-gray-400 text-sm leading-relaxed">
              [클라이언트 로고 그리드]<br />
              각 기업·기관의 공식 로고를 그레이스케일 처리하여 배치.<br />
              마우스 오버 시 컬러 전환. 권장: 3열 × 4행 (12개 로고)
            </p>
          </div>

          {/* 텍스트 기반 클라이언트 목록 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clients.map((group) => (
              <div key={group.category}>
                <h4 className="text-xs font-bold text-[#b1ff57] uppercase tracking-wider mb-3">
                  {group.category}
                </h4>
                <ul className="space-y-1.5">
                  {group.companies.map((c) => (
                    <li key={c} className="text-gray-700 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff8a] flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 케이스 스터디 플레이스홀더 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8">주요 프로젝트</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "디즈니코리아 × 초록우산",
                sub: "미디어 리터러시 교육",
                desc: "주니어 스토리텔링 클래스 미디어 리터러시(시민성) 강의 진행. 아동·청소년 대상 디지털 미디어 교육.",
              },
              {
                title: "한국무역협회",
                sub: "글로벌 SNS 마케팅",
                desc: "해외 진출을 준비하는 기업 담당자 대상 글로벌 SNS 마케팅 전략 특강. 10회 이상 진행.",
              },
            ].map((proj) => (
              <div key={proj.title} className="bg-gray-50 rounded-2xl overflow-hidden group">
                <div className="aspect-video bg-gray-200 flex flex-col items-center justify-center border-b border-dashed border-gray-300">
                  <span className="text-3xl mb-2">🖼</span>
                  <p className="text-gray-400 text-xs text-center px-6">
                    [프로젝트 이미지]<br />
                    강의 현장 또는 협업 결과물 사진
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-[#b1ff57] text-xs font-semibold mb-1">{proj.sub}</p>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{proj.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{proj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
