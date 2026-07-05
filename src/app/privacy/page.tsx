import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { RETENTION_YEARS } from "@/lib/config";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 커넥트유",
  description: "커넥트유 개인정보처리방침",
};

// ⚠️ 아래 [ ] 표시 항목은 실제 사업자 정보로 교체하세요.
const COMPANY = {
  name: "커넥트유",
  representative: "남궁혜지",
  bizNumber: "671-37-01369",
  address: "인천광역시 영종구 영종대로162번길 20, 305호 D-62(운서동)",
  managerName: "남궁혜지",
  managerContact: "connectu_team@naver.com / 010-3207-5251",
  retentionYears: RETENTION_YEARS,
  // 시행일 = 이 방침을 실제로 적용(홈페이지 오픈)하는 날. 오픈일에 맞춰 수정하세요.
  effectiveDate: "2026-07-05",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          개인정보처리방침
        </h1>
        <p className="text-sm text-gray-400 mb-10">
          시행일: {COMPANY.effectiveDate}
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          <p>
            {COMPANY.name}(이하 &lsquo;회사&rsquo;)은 「개인정보 보호법」에 따라
            정보주체의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위하여
            다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              1. 수집하는 개인정보 항목
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수: 이름, 소속 기관/기업, 이메일, 문의 유형, 문의 내용</li>
              <li>선택: 연락처(전화번호)</li>
              <li>
                자동 수집: 문의 접수 일시, 개인정보 수집·이용 동의 여부
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              2. 개인정보의 수집·이용 목적
            </h2>
            <p>
              강의·교육·컨설팅 문의에 대한 상담 및 응대, 회신 연락, 문의 이력
              관리를 위해 개인정보를 이용합니다. 수집한 개인정보는 명시한 목적
              이외의 용도로 이용하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              3. 개인정보의 보유 및 이용기간
            </h2>
            <p>
              수집·이용 목적 달성 후 지체 없이 파기하는 것을 원칙으로 하되,
              문의 응대 및 분쟁 대응을 위해 문의 접수일로부터{" "}
              <strong>{COMPANY.retentionYears}년간</strong> 보관 후 파기합니다.
              (관계 법령에 별도의 보존 의무가 있는 경우 해당 기간을 따릅니다.)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만
              법령에 따라 요구되는 경우는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              5. 개인정보 처리의 위탁
            </h2>
            <p>
              회사는 원활한 서비스 운영을 위해 아래와 같이 개인정보 처리 업무를
              위탁하고 있으며, 위탁계약 시 개인정보가 안전하게 관리되도록 필요한
              사항을 규정하고 있습니다.
            </p>
            <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 w-32">
                      수탁자
                    </td>
                    <td className="px-4 py-2.5">Supabase Inc.</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700">
                      위탁 업무
                    </td>
                    <td className="px-4 py-2.5">
                      문의 데이터의 저장 및 데이터베이스 호스팅
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700">
                      보관 위치
                    </td>
                    <td className="px-4 py-2.5">대한민국 (Seoul 리전)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              6. 정보주체의 권리·의무 및 행사 방법
            </h2>
            <p>
              정보주체는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지
              를 요구할 수 있으며, 아래 개인정보 보호책임자에게 연락하시면 지체
              없이 조치합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              7. 개인정보의 파기 절차 및 방법
            </h2>
            <p>
              보유기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이
              파기합니다. 전자적 파일은 복구·재생이 불가능한 방법으로 영구
              삭제합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              8. 개인정보의 안전성 확보 조치
            </h2>
            <p>
              회사는 접근 권한 관리, 데이터베이스 접근 통제(RLS) 및 서버 전용
              비밀키 관리, 전송 구간 암호화(HTTPS) 등 개인정보의 안전성 확보를
              위한 조치를 시행하고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              9. 개인정보 보호책임자
            </h2>
            <ul className="space-y-1">
              <li>성명: {COMPANY.managerName}</li>
              <li>연락처: {COMPANY.managerContact}</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              사업자 정보 — 상호: {COMPANY.name} / 대표: {COMPANY.representative}{" "}
              / 사업자등록번호: {COMPANY.bizNumber} / 주소: {COMPANY.address}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              10. 개정에 관한 사항
            </h2>
            <p>
              이 개인정보처리방침은 {COMPANY.effectiveDate}부터 적용됩니다.
              내용의 추가·삭제·수정이 있을 경우 시행일 전에 홈페이지를 통해
              공지합니다.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
