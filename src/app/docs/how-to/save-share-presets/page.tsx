import { DocsContent, DocSection, Tip } from '@/components/docs/DocsContent';
import Image from 'next/image';

export default function SaveSharePresetsPage() {
  return (
    <DocsContent
      title="프리셋 저장하고 공유하기"
      description="자주 쓰는 블록 조합을 프리셋으로 저장하고 팀원들과 공유하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          <strong>프리셋(Preset)</strong>은 자주 사용하는 블록 조합을 이름 붙여 저장하는 기능입니다.
          같은 스타일이나 구조를 반복해서 사용할 때 시간을 절약할 수 있습니다.
        </p>
      </DocSection>

      <DocSection title="프리셋 저장">
        <ol className="list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
          <li>블록 조합 완성</li>
          <li>"프리셋 저장" 버튼 클릭</li>
          <li>프리셋 이름 입력 (예: "브랜드 A 스타일")</li>
          <li>저장 완료</li>
        </ol>
        <div className="mt-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
          <Image
            src="/images/app-assemble-empty.png"
            alt="프리셋 저장"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Assemble 페이지에서 프리셋을 저장하고 관리합니다
        </p>
        <Tip>
          저장되는 내용: 블록 조합 및 순서, 선택된 스타일 아티스트, Midjourney 파라미터 설정
        </Tip>
      </DocSection>

      <DocSection title="프리셋 불러오기">
        <ol className="list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
          <li>"프리셋" 버튼 클릭 (Assemble 페이지 상단)</li>
          <li>저장된 프리셋 목록 확인</li>
          <li>원하는 프리셋 클릭</li>
          <li>블록들이 자동으로 로드됨</li>
        </ol>
      </DocSection>

      <DocSection title="공유 링크 생성">
        <ol className="list-inside list-decimal space-y-2 text-[var(--color-text-secondary)]">
          <li>Assemble에서 "공유" 버튼 클릭</li>
          <li>공유 링크 자동 생성</li>
          <li>링크 복사하여 팀원에게 공유</li>
        </ol>
      </DocSection>
    </DocsContent>
  );
}
