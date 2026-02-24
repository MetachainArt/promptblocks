import { DocsContent, DocSection, Tip, Warning } from '@/components/docs/DocsContent';

export default function FaceConsistencyPage() {
  return (
    <DocsContent
      title="얼굴 일관성 유지하기"
      description="같은 캐릭터를 다양한 상황에서 일관되게 생성하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          얼굴 일관성(Face Consistency) 기능은 캐릭터의 외형을 고정하고 배경, 의상, 포즈 등만
          변경하여 같은 인물이 등장하는 다양한 이미지를 생성할 수 있게 합니다.
        </p>
      </DocSection>

      <DocSection title="단계별 가이드">
        <ol className="list-inside list-decimal space-y-4 text-[var(--color-text-secondary)]">
          <li>
            <strong>캐릭터 이미지 분석</strong>
            <p className="mt-1 ml-6">Decompose 페이지에서 캐릭터 이미지를 업로드하고 분석하세요.</p>
          </li>
          <li>
            <strong>얼굴 기준 저장</strong>
            <p className="mt-1 ml-6">분석 결과 하단의 "얼굴 기준 저장" 버튼을 클릭하세요.</p>
          </li>
          <li>
            <strong>설정 페이지 확인</strong>
            <p className="mt-1 ml-6">
              설정 페이지에서 얼굴 일관성 섹션을 확인하고 자동 적용 옵션을 켜세요.
            </p>
          </li>
          <li>
            <strong>블록 잠금</strong>
            <p className="mt-1 ml-6">Assemble에서 Subject Type과 Appearance 블록을 잠그세요.</p>
          </li>
          <li>
            <strong>다른 요소 변경</strong>
            <p className="mt-1 ml-6">
              Background, Outfit, Pose 등 잠금되지 않은 블록들을 자유롭게 변경하세요.
            </p>
          </li>
        </ol>
      </DocSection>

      <DocSection title="팁과 모범사례">
        <Tip>
          <strong>효과적인 얼굴 앵커 작성:</strong>
          <ul className="mt-2 list-inside list-disc">
            <li>구체적: "Asian woman"보다 "Korean woman in her 20s"</li>
            <li>고유 특징: "mole on left cheek", "freckles across nose"</li>
            <li>헤어스타일: "bob cut with bangs", "waist-length wavy hair"</li>
          </ul>
        </Tip>

        <Warning>과도한 잠금은 창의성을 저하시킬 수 있습니다. 필수적인 블록만 잠그세요.</Warning>
      </DocSection>
    </DocsContent>
  );
}
