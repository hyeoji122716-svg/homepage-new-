const careers = [
  {
    type: "현재",
    items: [
      "콘텐츠 마케팅 / 강연 회사 「커넥트유」 대표",
      "SNS 마케팅 / 미디어 제작 강사",
      "전라남도 통상닥터제 마케팅 컨설턴트",
      "경기도 소상공인 경영역량강화교육 「소상공인 마케팅」 강사",
      "충북콘텐츠코리아랩 액셀러레이팅 사업 멘토",
      "충남산학융합원 청년창업지원센터 멘토",
      "(주)트레이드스쿨 「글로벌 SNS 전략 파트너」",
    ],
  },
  {
    type: "이전",
    items: [
      "문화체육관광부 / 국민체육진흥공단 / 한국체육대학교 「비대면 스포츠코칭 지원사업」 마케팅 강사 및 컨설턴트",
      "인플루언서 마케팅 회사 「주식회사 메가브랜딩」 이사",
      "인플루언서 마케팅 회사 50만 왕홍 「上海丽妩文化传媒有限公司」 담당 PD",
    ],
  },
];

const education = [
  {
    school: "상해사범대학교 (Shanghai Normal University)",
    major: "汉语言 대외한어 전공 (학사)",
    period: "2017.09 – 2020.01",
  },
  {
    school: "연세대학교 미래교육원",
    major: "브랜드 전문가과정 42기 (수료)",
    period: "2023.03 – 2023.06",
  },
];

const qualifications = [
  { name: "마케팅 기획 전문가 1급", date: "2024.11.28" },
  { name: "리더십지도자 1급 / 웃음지도사 1급 / 레크리에이션 1급", date: "2022.08.22" },
  { name: "GTQ (어도비 포토샵) 1급", date: "2020.12.18" },
  { name: "컴퓨터 활용능력 2급", date: "2020.08.14" },
];

const specialties = [
  { icon: "📱", title: "SNS 마케팅 & 영상 제작", desc: "인스타그램, 유튜브, 틱톡 등 플랫폼별 맞춤 콘텐츠 전략" },
  { icon: "🤖", title: "AI 활용 콘텐츠", desc: "생성형 AI를 활용한 효율적인 마케팅 콘텐츠 제작" },
  { icon: "🎬", title: "숏폼 콘텐츠 제작", desc: "릴스·쇼츠·틱톡 등 숏폼 영상 기획 및 제작 실습" },
  { icon: "🎨", title: "디자인 콘텐츠 제작", desc: "Canva·포토샵 등을 활용한 마케팅 시각 콘텐츠 제작" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16">
          <p className="text-[#b1ff57] text-sm font-semibold tracking-widest uppercase mb-2">About</p>
          <h2 className="text-4xl font-bold text-gray-900">강사 소개</h2>
        </div>

        {/* 프로필 카드 */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          {/* 프로필 이미지 자리 */}
          <div className="relative aspect-[3/4] max-w-sm mx-auto w-full">
            <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-5xl mb-4">📸</span>
              <p className="text-gray-400 text-sm text-center px-6 leading-relaxed">
                [프로필 사진]<br />
                강사의 전문적인 프로필 사진.<br />
                밝은 배경 또는 스튜디오 촬영본.<br />
                권장 비율: 3:4 세로형
              </p>
            </div>
            {/* 경력 뱃지 */}
            <div className="absolute -bottom-4 -right-4 bg-[#b1ff57] text-gray-900 rounded-2xl px-5 py-3 shadow-lg">
              <div className="text-2xl font-bold">8년+</div>
              <div className="text-xs opacity-90">강의 경력</div>
            </div>
          </div>

          {/* 텍스트 */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">남궁혜지</h3>
            <p className="text-[#b1ff57] font-semibold mb-6">커넥트유 대표 · SNS 마케팅 / 미디어 콘텐츠 전문 강사</p>
            <p className="text-gray-600 leading-relaxed mb-6">
              디즈니코리아, NH투자증권, 한국무역협회 등 국내 주요 기업·기관에서 640회 이상의 강연을 진행한
              미디어 콘텐츠 전문가입니다. SNS 마케팅부터 AI 활용 콘텐츠 제작, 숏폼 영상 기획까지 —
              현장 중심의 실전 강의로 수강생의 즉각적인 변화를 이끌어냅니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              상해에서의 중국 인플루언서 마케팅 현장 경험과 국내 대기업·공공기관을 아우르는 폭넓은 강의 이력을 바탕으로,
              조직의 디지털 마케팅 역량을 한 단계 높이는 맞춤형 교육·컨설팅을 제공합니다.
            </p>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <span className="text-[#b1ff57]">✦</span>
              <span>마케팅 섭외 1위 · 압도적 만족도 4.9점</span>
            </div>
          </div>
        </div>

        {/* 전문 분야 */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">전문 분야</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((s) => (
              <div key={s.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-[#f2ffe0] transition-colors group">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#3d6b00] transition-colors">{s.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 경력 */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">주요 경력</h3>
            <div className="space-y-6">
              {careers.map((group) => (
                <div key={group.type}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    group.type === "현재"
                      ? "bg-[#e6ffc2] text-[#3d6b00]"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {group.type}
                  </span>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2 text-gray-600 text-sm">
                        <span className="text-[#b1ff57] mt-0.5 flex-shrink-0">›</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">학력</h3>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.school} className="border-l-2 border-[#d5ffaa] pl-4">
                    <div className="font-semibold text-gray-900">{edu.school}</div>
                    <div className="text-gray-600 text-sm">{edu.major}</div>
                    <div className="text-gray-400 text-xs mt-1">{edu.period}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">자격 사항</h3>
              <div className="space-y-3">
                {qualifications.map((q) => (
                  <div key={q.name} className="flex justify-between items-start gap-4">
                    <span className="text-gray-700 text-sm">{q.name}</span>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{q.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
