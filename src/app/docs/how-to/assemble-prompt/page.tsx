import { DocsContent, DocSection, Tip, Warning } from '@/components/docs/DocsContent';
import Image from 'next/image';

export default function AssemblePromptPage() {
  return (
    <DocsContent
      title="효과적인 프롬프트 조립하기"
      description="라이브러리의 블록을 조합하여 완성도 높은 프롬프트를 생성하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          <strong>Assemble</strong>은 저장된 블록을 조합하여 새로운 프롬프트를 만드는 기능입니다.
          드래그앤드롭, 잠금, 무작위 조합 등 다양한 도구를 활용할 수 있습니다.
        </p>
      </DocSection>

      <DocSection title="단계별 가이드">
        <ol className="list-inside list-decimal space-y-4 text-[var(--color-text-secondary)]">
          <li>
            <strong>Assemble 페이지로 이동</strong>
            <p className="mt-1 ml-6">좌측 납비게이션에서 "Assemble"를 클릭하세요.</p>
          </li>
          <li>
            <strong>블록 추가</strong>
            <p className="mt-1 ml-6">
              "블록 추가" 버튼을 클릭하고 라이브러리에서 원하는 블록을 선택하세요.
            </p>
            <div className="mt-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
              <Image
                src="/images/app-block-modal.png"
                alt="블록 추가 모달"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              라이브러리에서 원하는 블록을 선택하여 추가합니다
            </p>
          </li>
          <li>
            <strong>블록 순서 변경</strong>
            <p className="mt-1 ml-6">
              드래그앤드롭으로 블록 순서를 조정하세요. 프롬프트에서 앞에 올수록 중요도가 높아집니다.
            </p>
          </li>
          <li>
            <strong>블록 잠금</strong>
            <p className="mt-1 ml-6">
              잠금 아이콘을 클릭하여 무작위 조합 시 변경되지 않도록 보호하세요.
            </p>
          </li>
          <li>
            <strong>작가 스타일 추가</strong>
            <p className="mt-1 ml-6">카테고리에서 원하는 작가를 선택하세요.</p>
          </li>
          <li>
            <strong>프롬프트 복사</strong>
            <p className="mt-1 ml-6">
              "복사" 버튼을 클릭하여 완성된 프롬프트를 클립보드에 복사하세요.
            </p>
          </li>
        </ol>
      </DocSection>

      <DocSection title="고급 기능">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">🎲 무작위 조합</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              잠금되지 않은 블록만 대상으로 랜덤 교체
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">💾 프리셋 저장</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              자주 쓰는 조합을 이름 붙여 저장
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">📸 스냅샷</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              현재 상태를 저장하고 나중에 복원
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">🔗 공유 링크</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              읽기 전용 링크 생성하여 공유
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="효과적인 프롬프트 구조">
        <div className="rounded-lg bg-[var(--color-background)] p-4">
          <ol className="list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
            <li>주제 유형 (누구/무엇)</li>
            <li>외형/의상 (어떤 모습)</li>
            <li>포즈/표정 (무엇을 하는지)</li>
            <li>배경/환경 (어디에서)</li>
            <li>조명/카메라 (어떻게 촬영)</li>
            <li>스타일/색감 (어떤 느낌)</li>
          </ol>
        </div>

        <Tip>
          Midjourney 팁: 주제는 앞에, 스타일은 뒤에 배치하세요. 중요한 키워드는 ::weight로 강조할 수
          있습니다.
        </Tip>
      </DocSection>
    </DocsContent>
  );
}
