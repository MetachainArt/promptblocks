import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)]">개인정보처리방침</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">최종 수정일: 2026-02-13</p>

        <section className="mt-8 space-y-6 text-sm leading-7 text-[var(--color-text-primary)]">
          <section>
            <h2 className="text-base font-bold">1. 수집하는 정보</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">구분</th>
                    <th className="px-4 py-2 font-semibold">항목</th>
                    <th className="px-4 py-2 font-semibold">수집 시점</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="px-4 py-2 font-medium">계정 정보</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      이메일, 인증 식별값
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      회원가입, 로그인
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">서비스 설정 정보</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      선호 모델, 사용자 설정, 저장한 프롬프트 블록
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">기능 사용 시</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">입력 데이터</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      프롬프트 텍스트, 업로드 이미지
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      분해, 분석, 조립 수행 시
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">운영 로그</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      사용 기록, 오류 로그, 보안 점검 로그
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      서비스 운영 중 자동 수집
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold">2. 개인정보 이용 목적</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li>회원 인증, 계정 관리, 비밀번호 재설정 등 기본 서비스 제공</li>
              <li>프롬프트 분해, 블록 저장, 조립 등 핵심 기능 제공</li>
              <li>오류 대응, 품질 개선, 부정 이용 방지 및 보안 강화</li>
              <li>서비스 공지 및 이용자 문의 대응</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold">3. 보관 및 파기</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">항목</th>
                    <th className="px-4 py-2 font-semibold">보관 기간</th>
                    <th className="px-4 py-2 font-semibold">파기 기준</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="px-4 py-2 font-medium">계정 정보</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      회원 탈퇴 시까지
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      탈퇴 처리 완료 후 즉시 또는 법정 보관기간 경과 후 파기
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">프롬프트/이미지 입력 데이터</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      이용자가 삭제할 때까지 또는 기능 목적 달성 시
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      복구 불가능한 방식으로 파기
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">운영 로그</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">최대 12개월</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      보관기간 만료 시 자동 삭제
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold">4. 제3자 제공 및 처리위탁</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              서비스는 기능 수행을 위해 아래 외부 서비스를 사용합니다.
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
                <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">수탁사</th>
                    <th className="px-4 py-2 font-semibold">처리 목적</th>
                    <th className="px-4 py-2 font-semibold">국외 이전 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="px-4 py-2 font-medium">Supabase</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      인증, 사용자 데이터 저장 및 조회
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      가능 (클라우드 리전 정책 따름)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">OpenAI</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      프롬프트 분석 및 생성 요청 처리
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">가능</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Google Gemini API</td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                      프롬프트 분석 및 생성 요청 처리
                    </td>
                    <td className="px-4 py-2 text-[var(--color-text-secondary)]">가능</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              이용자는 AI 기능 사용 시 프롬프트 또는 이미지 데이터가 외부 AI API로 전송될 수 있음을
              이해하고 동의합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">5. 이용자의 권리</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text-secondary)]">
              <li>이용자는 개인정보 열람, 정정, 삭제 및 처리정지를 요청할 수 있습니다.</li>
              <li>계정 탈퇴 시 관련 정보는 운영 정책 및 법령에 따라 처리됩니다.</li>
            </ul>
            <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text-secondary)]">
              권리행사 문의: reedo.dev@dmssolution.co.kr
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold">6. 개인정보 보호조치</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              서비스는 접근 통제, 권한 관리, 전송 구간 보호, 로그 모니터링 등 합리적인 기술적 및
              관리적 보호조치를 적용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold">7. 방침 변경</h2>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              본 방침 내용이 변경되는 경우 시행일 전 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>
        </section>

        <div className="mt-10 flex gap-3">
          <Link
            href="/terms"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            이용약관 보기
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
