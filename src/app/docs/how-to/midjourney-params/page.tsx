import { DocsContent, DocSection, Tip, Warning } from '@/components/docs/DocsContent';

export default function MidjourneyParamsPage() {
  return (
    <DocsContent
      title="Midjourney 파라미터 사용하기"
      description="Midjourney 고급 파라미터를 활용하여 더 정교한 이미지를 생성하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          Midjourney는 --sref, --sw, --ar 등 다양한 파라미터를 지원합니다. PromptBlocks에서는
          Assemble에서 이러한 파라미터를 쉽게 추가할 수 있습니다.
        </p>
      </DocSection>

      <DocSection title="주요 파라미터">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              --sref (Style Reference)
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              특정 이미지의 스타일을 참조
            </p>
            <code className="mt-2 block rounded bg-black/5 p-2 text-sm">--sref 123456</code>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">--sw (Style Weight)</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              SREF 스타일 강도 (0-1000)
            </p>
            <code className="mt-2 block rounded bg-black/5 p-2 text-sm">--sw 200</code>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">--ar (Aspect Ratio)</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">이미지 비율 설정</p>
            <code className="mt-2 block rounded bg-black/5 p-2 text-sm">--ar 16:9</code>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">--seed</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              재현 가능한 결과를 위한 시드값
            </p>
            <code className="mt-2 block rounded bg-black/5 p-2 text-sm">--seed 12345</code>
          </div>
        </div>
      </DocSection>

      <DocSection title="사용 예시">
        <div className="rounded-lg bg-[var(--color-background)] p-4">
          <h4 className="font-semibold text-[var(--color-text-primary)]">일관된 스타일 시리즈</h4>
          <pre className="mt-2 overflow-x-auto rounded bg-black/5 p-3 text-sm text-[var(--color-text-secondary)]">
            {`beautiful Korean woman in white dress, soft lighting, 
--sref 123456 --sw 200 --ar 2:3 --seed 12345`}
          </pre>
        </div>
      </DocSection>

      <DocSection title="팁">
        <Tip>
          파라미터 우선순위: 1) 주제/설명 2) 스타일 참조 (--sref) 3) 비율/품질 4) 시드/카오스
        </Tip>
      </DocSection>
    </DocsContent>
  );
}
