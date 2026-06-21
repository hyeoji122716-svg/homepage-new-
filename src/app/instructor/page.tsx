import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "강사 소개 | 커넥트유 남궁혜지",
  description:
    "비전공자로 시작해 대기업 강의까지 섭렵한 숏폼 마케팅 전문 강사 남궁혜지의 이야기.",
};

const qaItems = [
  {
    q: "강사 본인 소개와 어떤 강의를 하시는지 부탁드립니다.",
    body: (
      <div className="space-y-4">
        <p>
          안녕하세요! 남궁혜지 강사입니다. 자극적인 스토리가 아닌 나만의
          이야기로 만드는 콘텐츠, &apos;커민뉴데이&apos; 프로젝트를 통해
          여러분의 이야기를 세상에 알리는 숏폼 마케팅 전문가입니다.
        </p>
        <p>
          비전공자로 시작해 2025 고등학교 마케팅 교과서까지 집필 중이며,
          현재는 기업과 기관에서 주로 강의하고 있습니다. 최근 대기업까지
          영역을 확대하며 4년간 <strong>6,000명이 넘는 수강생</strong>을
          만났습니다.
        </p>
        <p>
          숏폼 콘텐츠 제작, SNS 마케팅, 영상 콘텐츠 기획 강의를 진행합니다.
          특히 인스타그램 릴스, 유튜브 쇼츠, 틱톡을 활용한 콘텐츠 제작이 주된
          강의이며, 최근에는 AI를 활용한 챗GPT를 통한 콘텐츠 기획·제작 수업도
          함께 진행하고 있습니다.
        </p>
      </div>
    ),
  },
  {
    q: "특히 어떤 분들을 위한 강의를 하고 계시나요?",
    body: (
      <div className="space-y-4">
        <p>크게 세 분야로 나누어 강의를 진행하고 있습니다.</p>
        <ul className="space-y-3 mt-2">
          {[
            {
              label: "자영업자",
              desc: "실질적인 매출 증대 전략 / 마케팅과 브랜딩",
            },
            {
              label: "청년",
              desc: "자신의 꿈을 실현할 수 있는 콘텐츠 기획 및 제작방법 (취업 · N잡 · 창업과도 연결)",
            },
            {
              label: "기업",
              desc: "임직원들을 위한 숏폼 제작 수업 — 조별 팀빌딩",
            },
          ].map((item) => (
            <li key={item.label} className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#b1ff57] shrink-0" />
              <span>
                <strong className="text-gray-900">{item.label}</strong>
                {" — "}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    q: "처음 강의를 시작하게 된 계기가 무엇인가요?",
    body: (
      <div className="space-y-6">
        <p>
          저는 전공자도 아니고 강의를 원래 하던 사람도 아닙니다. 강의, 특히
          영상 쪽에 눈을 뜨게 된 데는 크게 두 가지 이유가 있습니다.
        </p>
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              영상/마케팅에 눈 뜨게 된 계기
            </h3>
            <p>
              중국에서 유학생 시절 참여했던 SNS 마케팅 대회에서 대상을 수상한
              경험이 있습니다. 그때부터 콘텐츠 제작에 대한 열정이 생겼고, 이후
              중국 SNS 플랫폼에서 한국인 뷰티 왕홍(35만→50만)의 PD를 맡으며
              영상 기획과 제작 쪽에 눈을 뜨게 됐습니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              강의를 시작하게 된 계기
            </h3>
            <p>
              귀국 후 중국어 과외를 하며 누군가에게 지식을 전달하는 게 적성에
              잘 맞는다는 걸 알았습니다. 그 후 영상 교육을 시작하게 되었고,
              지금은 분야를 좁혀 숏폼/마케팅으로 집중하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    q: "교육생들이 강의를 통해 어떤 효과와 결과를 얻을 수 있을까요?",
    body: (
      <div className="space-y-4">
        <p>
          실질적인 콘텐츠 성과를 얻어갈 수 있습니다. 또한 실행력과
          동기부여 — &lsquo;나도 할 수 있구나&rsquo;라는 것을 직접 경험하게
          됩니다.
        </p>
        <p>
          항상 저는 &lsquo;강의를 컨설팅처럼 진행하자&rsquo;라는 말을 마음에
          새기고 강의에 임합니다. 개별 교육생의 상황에 맞춘 맞춤형 피드백을
          제공해서 각자가 가진 문제를 해결하고 목표를 달성할 수 있도록 돕습니다.
        </p>
        <p>
          청년들은 수업을 들으며 취업을 한 친구들도 많고, 부캐로 활동하며
          수익을 올리기도 합니다. 자영업자분들은 잘 만든 콘텐츠 하나로 한달치
          예약이 모두 마감되기도 합니다. 기업·기관 담당자분들은 참여도, 만족도,
          이해도가 높아 이번달도 거의 다 재섭외와 소개 스케줄이 꽉 찼어요.
        </p>
      </div>
    ),
  },
  {
    q: "강사님이 생각하는 본인 강사로서의 자랑은 무엇인가요?",
    body: (
      <div className="space-y-4">
        <p>
          작년까지 제 별명이 십잡스였는데, 요식업도 운영하고 디자인도 하고
          제가 해볼 수 있는 건 다 해봤습니다. 그래서 모든 상황에 대한 콘텐츠가
          건들면 딱 나와요! 정말 다양한 경험이 쌓여 있습니다.
        </p>
        <p>
          그래서 뜬구름이 아닌 실질적인 이야기를 전달할 수 있고, 그에 따른
          결과도 나오는 게 제 자랑거리라고 생각합니다. 제 강의는 단순히 이론적인
          지식을 전달하는 것이 아니라, 교육생들이 직접 실행할 수 있는 구체적인
          전략과 방법을 제시합니다.
        </p>
        <p>
          초등학생부터 70대까지 모두 나이 강의했다는 사실도 자랑거리입니다.
          모두가 이해하는 수업을 기획하고 운영하면서도, 수준은 절대 낮추지
          않습니다!
        </p>
      </div>
    ),
  },
  {
    q: "어떤 방식으로 강의를 하시나요?",
    body: (
      <div className="space-y-5">
        <p>
          거의 모든 수업에 실습을 넣습니다. 수강생들은 정말 귀한 시간을 내서
          강의를 들으러 온 거잖아요. 저는 수강생들이 손에 뭐라도 꼭 쥐어서
          보내려고 합니다. 그래서 실습형 수업을 지향합니다.
        </p>
        <p>
          콘텐츠 기획부터 영상 결과물 제작까지 A to Z 수업을 진행해요.
          수강생들이 만든 콘텐츠에 피드백을 전달하며 마케팅에 대한 이해도를
          높여줍니다. 비대면도 동일하게 진행하며, 소규모로 개별 메세지도
          전달합니다.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            "트렌드 이해",
            "아이디어 도출",
            "콘텐츠 기획",
            "수익화 방안",
            "촬영 및 제작",
            "피드백 전달",
            "콘텐츠 업로드",
            "성과 분석",
          ].map((step, i) => (
            <div
              key={step}
              className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"
            >
              <div className="text-[#b1ff57] font-bold text-xs mb-1">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-700 font-medium leading-tight">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    q: "강사님 또는 강의 콘텐츠를 한 줄로 표현한다면?",
    body: (
      <div className="space-y-4">
        <blockquote className="bg-[#f2ffe0] border border-[#b1ff57]/40 rounded-2xl px-8 py-6 text-xl font-bold text-gray-900 text-center">
          &ldquo;실질적인 성과를 이끄는 창의적인 콘텐츠 기획과 마케팅
          전략.&rdquo;
        </blockquote>
        <p>
          모든 사람에게 맞춤형으로 콘텐츠를 기획하고 전략을 짜주는 게 저의
          가장 큰 능력입니다. 콘텐츠에 대한 고민, 돌고 돌아 오시면 다
          바드릴게요 :)
        </p>
      </div>
    ),
  },
  {
    q: "앞으로 강사님의 목표는 무엇인가요?",
    body: (
      <div className="space-y-4">
        <p>
          강사로서의 목표라면, 수강생들과 친구처럼 편하게 조언할 수 있는 강사가
          되고 싶어요. 그들의 마음에 제가 불을 켜줬으니 끝까지 책임져야 하지
          않겠어요?
        </p>
        <p>
          앞으로는 더 많은 수강생들이 자신의 목표를 실현할 수 있도록 강의
          프로그램을 확장하고, 숏폼 콘텐츠 제작 분야에서 독보적인 전문가로
          자리매김하고 싶습니다.
        </p>
        <p>
          그리고 새로운 플랫폼과 트렌드에 맞춘 교육 콘텐츠를 지속적으로
          개발하려 합니다. 감사합니다 :)
        </p>
      </div>
    ),
  },
];

export default function InstructorPage() {
  return (
    <>
      <Nav />
      <main>
        {/* 히어로 */}
        <section className="bg-gray-900 pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#b1ff57] text-xs font-semibold tracking-widest uppercase mb-5">
              Connect Your Dreams with Content
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              남궁혜지 강사 소개
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              비전공자로 시작해 대기업 강의까지 섭렵한
              <br />
              숏폼 마케팅 전문가의 이야기
            </p>
          </div>
        </section>

        {/* 핵심 수치 요약 */}
        <section className="bg-[#b1ff57] py-10 px-6">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: "640+", label: "출강 횟수" },
              { num: "6,000+", label: "누적 수강생" },
              { num: "4.9점", label: "평균 만족도" },
              { num: "8년+", label: "강의 경력" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {s.num}
                </div>
                <div className="text-xs text-gray-700 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Q&A */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="space-y-16">
            {qaItems.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex gap-4 items-start mb-5">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[#b1ff57] flex items-center justify-center text-xs font-bold text-gray-900">
                    Q{idx + 1}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug pt-1">
                    {item.q}
                  </h2>
                </div>
                <div className="ml-12 text-gray-600 leading-relaxed text-[15px]">
                  {item.body}
                </div>
                {idx < qaItems.length - 1 && (
                  <div className="mt-16 h-px bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 연락처 CTA */}
        <section className="bg-gray-900 py-20 px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[#b1ff57] text-xs font-semibold tracking-widest uppercase mb-4">
              강사 섭외 문의
            </p>
            <h2 className="text-3xl font-bold text-white mb-6">
              남궁혜지 강사 연락처
            </h2>
            <div className="space-y-1 text-gray-400 mb-8 text-sm">
              <p>T: 010-3207-5251</p>
              <p>M: connectu_team@naver.com</p>
            </div>
            <a
              href="/#contact"
              className="inline-block px-8 py-4 bg-[#b1ff57] hover:bg-[#9ce040] text-gray-900 font-semibold rounded-full transition-all shadow-lg hover:shadow-[#b1ff57]/30 hover:scale-105"
            >
              강의 문의하기
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
