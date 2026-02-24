import { DocsContent, DocSection } from '@/components/docs/DocsContent';

const errors = [
  {
    error: '"API 키가 설정되지 않았습니다"',
    cause: 'OpenAI 또는 Gemini API 키가 입력되지 않음',
    solution: '설정 페이지에서 유효한 API 키를 입력하세요.',
  },
  {
    error: '"API 호출 한도를 초과했습니다"',
    cause: '묣 플랜 월 20회 분해 한도 초과',
    solution: 'Analytics 페이지에서 사용량을 확인하고, 필요시 Pro 플랜으로 업그레이드하세요.',
  },
  {
    error: '"파일 크기가 너무 큽니다"',
    cause: '이미지 파일이 20MB 초과',
    solution: '이미지 편집 프로그램에서 크기를 조정하거나 TinyPNG 등으로 압축하세요.',
  },
  {
    error: '"지원하지 않는 이미지 형식입니다"',
    cause: 'BMP, TIFF, RAW 등 비지원 형식',
    solution: 'JPG, PNG, WebP 형식으로 변환하세요.',
  },
  {
    error: '"분석 실패"',
    cause: '이미지 품질이 너무 낮거나 복잡함',
    solution: '더 선명한 이미지를 사용하거나, 다른 AI 모델로 시도하세요.',
  },
  {
    error: '"페이지가 느리게 로딩됩니다"',
    cause: '저장된 블록이 너무 많음 (500개 이상)',
    solution: '사용하지 않는 블록을 삭제하고 브라우저 캐시를 정리하세요.',
  },
];

export default function ErrorsPage() {
  return (
    <DocsContent
      title="오류 메시지 해결"
      description="PromptBlocks 사용 중 발생할 수 있는 오류와 해결 방법"
    >
      <DocSection title="일반적인 오류">
        <div className="space-y-4">
          {errors.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <h3 className="font-semibold text-red-600">{item.error}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                <strong>원인:</strong> {item.cause}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                <strong>해결책:</strong> {item.solution}
              </p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="문제 해결 체크리스트">
        <ul className="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>브라우저 새로고침 (F5)</li>
          <li>강력 새로고침 (Ctrl/Cmd + Shift + R)</li>
          <li>다른 브라우저에서 테스트</li>
          <li>시크릿/시크릿 모드로 테스트</li>
          <li>브라우저 캐시 및 쿠키 삭제</li>
          <li>VPN/프록시 비활성화</li>
        </ul>
      </DocSection>

      <DocSection title="지원 연락처">
        <p className="text-[var(--color-text-secondary)]">
          위 방법으로 해결되지 않는 문제가 있으신가요? 카카오톡 오픈채팅으로 문의해주세요.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href="https://open.kakao.com/o/sSPHn33g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            키보드 단축키 문의
          </a>
          <a
            href="https://open.kakao.com/o/sSPHn33g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            그 외 모든 문의 (PromptBlocks 오픈톡)
          </a>
        </div>
      </DocSection>
    </DocsContent>
  );
}
