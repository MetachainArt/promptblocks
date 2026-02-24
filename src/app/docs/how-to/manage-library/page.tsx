import { DocsContent, DocSection, Tip } from '@/components/docs/DocsContent';
import Image from 'next/image';

export default function ManageLibraryPage() {
  return (
    <DocsContent
      title="블록 라이브러리 관리하기"
      description="라이브러리에서 블록을 효율적으로 검색, 필터링, 정리하는 방법을 알아봅니다"
    >
      <DocSection title="개요">
        <p className="text-[var(--color-text-secondary)]">
          <strong>Library</strong>는 Decompose에서 저장한 블록을 관리하는 공간입니다. 태그, 컬렉션,
          즐겨찾기를 활용하여 블록을 체계적으로 정리할 수 있습니다.
        </p>
      </DocSection>

      <DocSection title="주요 기능">
        <div className="mt-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
          <Image
            src="/images/app-library.png"
            alt="라이브러리 페이지"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          블록 라이브러리에서 저장된 블록들을 관리합니다
        </p>
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">🔍 검색</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              블록 내용, 태그, 타입으로 실시간 검색
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">🏷️ 태그 필터링</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              인기 태그 클라우드로 빠른 필터링
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">📁 컬렉션</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">주제별로 블록 그룹화</p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)]">⭐ 즐겨찾기</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">자주 쓰는 블록 표시</p>
          </div>
        </div>
      </DocSection>

      <DocSection title="단계별 가이드">
        <ol className="list-inside list-decimal space-y-4 text-[var(--color-text-secondary)]">
          <li>
            <strong>Library 페이지로 이동</strong>
            <p className="mt-1 ml-6">좌측 납비게이션에서 "Library"를 클릭하세요.</p>
          </li>
          <li>
            <strong>블록 검색</strong>
            <p className="mt-1 ml-6">
              검색창에 키워드를 입력하세요. 내용/태그/타입 기반 검색이 가능합니다.
            </p>
          </li>
          <li>
            <strong>태그로 필터링</strong>
            <p className="mt-1 ml-6">
              태그 클라우드에서 원하는 태그를 클릭하여 해당 태그가 포함된 블록만 표시합니다.
            </p>
          </li>
          <li>
            <strong>정렬 변경</strong>
            <p className="mt-1 ml-6">최신순/즐겨찾기/타입순으로 정렬할 수 있습니다.</p>
          </li>
        </ol>

        <Tip>
          검색어는 실시간으로 필터링됩니다 (300ms 디바운스). 짧은 키워드보다 구체적인 검색어를
          사용하세요.
        </Tip>
      </DocSection>

      <DocSection title="모범사례">
        <ul className="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
          <li>
            <strong>정기 정리</strong>: 사용하지 않는 블록 삭제 (월 1회)
          </li>
          <li>
            <strong>의미 있는 컬렉션명</strong>: "Temp" 대신 "2024 봄 캠페인"
          </li>
          <li>
            <strong>일관된 태그</strong>: "portrait", "portraits" 중 하나로 통일
          </li>
          <li>
            <strong>복합 검색</strong>: 검색어 + 컬렉션 + 태그 조합 활용
          </li>
        </ul>
      </DocSection>
    </DocsContent>
  );
}
