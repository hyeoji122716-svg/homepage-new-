"use client";

import { useState } from "react";

const contactItems = [
  {
    icon: "✉️",
    label: "이메일",
    value: "문의 이메일을 입력해주세요",
    href: null,
  },
  {
    icon: "📞",
    label: "전화",
    value: "010-0000-0000",
    href: null,
  },
  {
    icon: "📸",
    label: "인스타그램",
    value: "@connectu_official",
    href: null,
  },
  {
    icon: "▶",
    label: "유튜브",
    value: "커넥트유 채널",
    href: null,
  },
];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    phone: "",
    type: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 추후 실제 전송 연동
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="mb-16">
          <p className="text-[#b1ff57] text-sm font-semibold tracking-widest uppercase mb-2">Contact</p>
          <h2 className="text-4xl font-bold">강의 · 컨설팅 문의</h2>
          <p className="text-gray-400 mt-4 max-w-xl">
            기업 강연, 교육 운영, 마케팅 컨설팅 문의를 남겨주시면 빠르게 답변드리겠습니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* 연락처 정보 */}
          <div>
            <div className="space-y-6 mb-12">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* SNS 이미지 플레이스홀더 */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-dashed border-gray-600">
              <p className="text-gray-500 text-sm text-center leading-relaxed">
                [SNS 피드 미리보기 또는 QR 코드]<br />
                인스타그램 최신 피드 3~4장 또는<br />
                카카오채널 / 오픈카톡 QR 코드 이미지
              </p>
            </div>

            {/* 강의 가능 지역 */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">강의 가능 지역</h4>
              <div className="flex flex-wrap gap-2">
                {["전국 출강 가능", "비대면(온라인) 가능", "해외 협의 가능"].map((loc) => (
                  <span
                    key={loc}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 문의 폼 */}
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-3">문의가 접수되었습니다</h3>
                <p className="text-gray-400">
                  빠른 시일 내에 연락드리겠습니다.<br />감사합니다.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-3 border border-gray-600 hover:border-[#b1ff57] rounded-full text-sm transition-colors"
                >
                  다시 문의하기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">이름 *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">소속 기관 / 기업</label>
                    <input
                      type="text"
                      value={form.org}
                      onChange={(e) => setForm({ ...form, org: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                      placeholder="OO 기업"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">이메일 *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">연락처</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                    placeholder="010-0000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">문의 유형</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white outline-none transition-colors text-sm appearance-none"
                  >
                    <option value="">선택해주세요</option>
                    <option value="lecture">기업 강연</option>
                    <option value="education">교육 프로그램 운영</option>
                    <option value="consulting">마케팅 컨설팅</option>
                    <option value="etc">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">문의 내용 *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm resize-none"
                    placeholder="강의 주제, 인원, 일정, 특이사항 등을 자유롭게 적어주세요."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#b1ff57] hover:bg-[#9ce040] text-gray-900 font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#b1ff57]/20"
                >
                  문의 보내기
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
