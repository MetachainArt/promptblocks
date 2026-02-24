import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)]">이용약관</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">최종 수정일: 2026-02-13</p>

        <section className="mt-8 space-y-6 text-sm leading-7 text-[var(--color-text-primary)]">
          <section>
            <h2 className="text-base font-bold">제1조 (목적)</h2>
            <p className="mt-1">
              본 약관은 PromptBlocks 서비스(이하 서비스)의 이용과 관련하여 서비스 제공자와 이용자의
              권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">제2조 (주요 기능)</h2>
            <p className="mt-1">서비스는 다음 기능을 제공합니다.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li>프롬프트 분해 및 블록화</li>
              <li>블록 라이브러리 저장, 검색, 조합</li>
              <li>프리셋, 히스토리, 공유 링크 등 작업 보조 기능</li>
              <li>외부 AI API를 활용한 분석 및 생성 보조 기능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold">제3조 (계정 및 이용자 책임)</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li>이용자는 계정 정보와 인증 수단을 안전하게 관리해야 합니다.</li>
              <li>이용자는 서비스 및 제3자의 권리를 침해하는 행위를 해서는 안 됩니다.</li>
              <li>이용자는 관련 법령을 위반하는 콘텐츠를 업로드 또는 공유해서는 안 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold">제4조 (금지행위)</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li>타인의 계정 도용, 무단 접근, 시스템 공격 및 서비스 운영 방해 행위</li>
              <li>불법 정보 유통, 타인의 지식재산권 또는 개인정보 침해 행위</li>
              <li>서비스 동작을 우회하거나 과도한 자동 요청을 발생시키는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold">제5조 (외부 AI 서비스 이용)</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              서비스 기능 수행을 위해 OpenAI, Google Gemini 등 외부 AI API가 사용될 수 있으며,
              이용자가 입력한 프롬프트 또는 이미지 데이터가 해당 API로 전달될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">제6조 (서비스 변경 및 중단)</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              서비스는 운영상 필요에 따라 기능을 변경하거나 일시적으로 중단할 수 있으며, 중요한
              변경사항은 사전에 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">제7조 (면책)</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              서비스는 AI 모델 특성에 따른 결과 편차를 보장하지 않으며, 이용자의 귀책 사유 또는 외부
              시스템 장애로 발생한 손해에 대해서는 관련 법령 범위 내에서 책임이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">제8조 (문의)</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              약관 관련 문의는 아래 문의처 또는 서비스 내 고객지원 채널을 통해 접수할 수 있습니다.
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">구분</th>
                    <th className="px-4 py-2 font-semibold">내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="px-4 py-2 font-medium">문의 이메일</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      reedo.dev@dmssolution.co.kr
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">운영시간</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      평일 10:00 - 18:00 (KST, 공휴일 제외)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">처리 목표</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      접수 후 영업일 기준 3일 이내 1차 답변
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold">부칙</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              본 약관은 2026년 2월 13일부터 적용됩니다. 서비스 정책 변경 시 개정 이력과 시행일을
              약관 페이지에 함께 고지합니다.
            </p>
          </section>
        </section>

        <div className="mt-10 flex gap-3">
          <Link
            href="/privacy"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            개인정보처리방침 보기
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            회원가입으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
