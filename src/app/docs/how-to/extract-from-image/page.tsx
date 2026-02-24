import {
  DocsContent,
  DocSection,
  DocSubsection,
  Tip,
  Warning,
} from '@/components/docs/DocsContent';

export default function ExtractFromImagePage() {
  return (
    <DocsContent
      title="이미지에서 프롬프트 추출하기"
      description="이미지를 업로드하여 AI가 자동으로 13개 요소로 분해하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          PromptBlocks의 <strong>Decompose</strong> 기능은 이미지를 분석하여 AI가 사용한 것으로
          추정되는 프롬프트를 13개 블록으로 추출합니다.
        </p>
      </DocSection>

      <DocSection title="전제조건">
        <ul className="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>PromptBlocks 계정</li>
          <li>분석할 이미지 (JPG, PNG, WebP, 최대 20MB)</li>
          <li>OpenAI 또는 Gemini API 키</li>
        </ul>
      </DocSection>

      <DocSection title="단계별 가이드">
        <DocSubsection title="1. Decompose 페이지로 이동">
          <p className="text-[var(--color-text-secondary)]">
            좌측 납비게이션에서 <strong>"Decompose"</strong>를 클릭하세요.
          </p>
        </DocSubsection>

        <DocSubsection title="2. 이미지 업로드">
          <p className="text-[var(--color-text-secondary)]">
            <strong>방법 A: 드래그앤드롭</strong>
          </p>
          <ol className="mt-2 list-inside list-decimal text-[var(--color-text-secondary)]">
            <li>컴퓨터에서 이미지 파일을 선택</li>
            <li>"이미지를 끌어다 놓으세요" 영역으로 드래그</li>
            <li>파일을 놓으면 업로드 완료</li>
          </ol>
          <Tip>선명하고 복잡하지 않은 이미지일수록 분석 정확도가 높아집니다.</Tip>
        </DocSubsection>

        <DocSubsection title="3. AI 모델 선택">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 text-left font-semibold">모델</th>
                  <th className="py-2 text-left font-semibold">특징</th>
                  <th className="py-2 text-left font-semibold">추천 상황</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-secondary)]">
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">GPT-5.2</td>
                  <td className="py-2">가장 정확한 분석</td>
                  <td className="py-2">일반적인 이미지</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">Gemini 3 Pro</td>
                  <td className="py-2">한국어에 강함</td>
                  <td className="py-2">한국인/아시아 캐릭터</td>
                </tr>
                <tr>
                  <td className="py-2">Gemini 3 Flash</td>
                  <td className="py-2">빠른 처리</td>
                  <td className="py-2">프로토타이핑</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DocSubsection>

        <DocSubsection title="4. 분석 실행">
          <p className="text-[var(--color-text-secondary)]">
            <strong>"이미지 분석 시작"</strong> 버튼을 클릭하세요.
          </p>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            분석에는 10초에서 2분 정도 소요됩니다. 진행 상태가 화면에 표시됩니다.
          </p>
        </DocSubsection>

        <DocSubsection title="5. 결과 확인 및 저장">
          <p className="text-[var(--color-text-secondary)]">
            분석이 완료되면 13개 블록이 표시됩니다:
          </p>
          <ul className="mt-2 list-inside list-disc text-[var(--color-text-secondary)]">
            <li>✅ 성공적으로 추출된 블록: 내용이 채워져 있음</li>
            <li>⚪ 추출되지 않은 블록: 이미지에 해당 요소가 없거나 확인 불가</li>
          </ul>
          <Warning>블록 내용을 수정하면 라이브러리에 저장될 때 수정된 내용이 저장됩니다.</Warning>
        </DocSubsection>
      </DocSection>

      <DocSection title="배치 분석 (여러 이미지)">
        <p className="text-[var(--color-text-secondary)]">
          최대 5개의 이미지를 동시에 분석할 수 있습니다:
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
          <li>이미지 선택 시 여러 파일 선택</li>
          <li>또는 이미지를 하나씩 추가</li>
          <li>
            <strong>"배치 분석 시작"</strong> 버튼 클릭
          </li>
          <li>각 이미지의 진행 상태가 개별적으로 표시됨</li>
          <li>모든 분석 완료 후 일괄 저장 가능</li>
        </ol>
      </DocSection>

      <DocSection title="팁과 모범사례">
        <Tip>
          <strong>효과적인 이미지 선택:</strong>
          <ul className="mt-2 list-inside list-disc">
            <li>고해상도: 1024x1024 이상 권장</li>
            <li>선명한 초점: 흐릿한 이미지는 분석 정확도 저하</li>
            <li>단순한 구도: 너무 복잡한 이미지는 오분석 가능</li>
          </ul>
        </Tip>

        <Warning>
          <strong>주의사항:</strong>
          <ul className="mt-2 list-inside list-disc">
            <li>저작권: 타인의 이미지 분석 시 저작권 주의</li>
            <li>개인정보: 얼굴이 포함된 이미지는 개인정보 보호 고려</li>
            <li>정확도 한계: AI 분석은 추정치이므로 100% 정확하지 않을 수 있음</li>
          </ul>
        </Warning>
      </DocSection>
    </DocsContent>
  );
}
