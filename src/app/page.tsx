import Link from 'next/link';
import { Blocks, Puzzle, Library, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* 헤더 */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Blocks className="h-6 w-6 text-[var(--color-primary)]" />
            <span className="text-xl font-bold text-[var(--color-text-primary)]">PromptBlocks</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-black"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] hover:text-black"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            이미지 프롬프트를
            <br />
            <span className="text-[var(--color-primary)]">블록처럼 조립</span>하세요
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-secondary)]">
            AI가 프롬프트를 13가지 요소로 분해하고, 저장된 블록을 레고처럼 조립해
            <br />
            새로운 프롬프트를 만들어보세요.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-primary-hover)] hover:text-black"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Fun Intro Section */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center gap-2">
              <span>🚀</span> PromptBlocks를 <span className="text-purple-600">200% 즐기는 법</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-colors">
                <span className="text-2xl pt-1">🧩</span>
                <p className="text-lg text-gray-700">
                  내 최애 이미지, AI가 <span className="text-yellow-600 font-bold">13가지 블록</span>으로 와르르 분해해드려요!
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-pink-200 transition-colors">
                <span className="text-2xl pt-1">📸</span>
                <p className="text-lg text-gray-700">
                  스타일, 캐릭터, 조명... 원하는 블록만 골라 <span className="text-pink-600 font-bold">레고처럼 찰칵!</span>
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100 hover:border-purple-300 transition-colors">
                <span className="text-2xl pt-1">🤪</span>
                <p className="text-lg text-gray-900 font-medium">
                  상상력 고갈? <span className="text-purple-700 font-bold">무작위 조립</span> 버튼을 꾹 눌러보세요, 혼돈의 명작이 탄생합니다!
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-colors">
                <span className="text-2xl pt-1">🤣</span>
                <p className="text-lg text-gray-700">
                  "어? 이게 되네?" 싶은 엉뚱하고 기발한 이미지에 <span className="text-green-600 font-bold">빵 터질지도 몰라요.</span>
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-cyan-200 transition-colors">
                <span className="text-2xl pt-1">✨</span>
                <p className="text-lg text-gray-700">
                  지금 바로 PromptBlocks에서 세상에 없던 <span className="text-cyan-600 font-bold">당신만의 꿀잼 조합</span>을 찾아보세요!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 기능 소개 */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 inline-flex rounded-lg bg-[var(--color-primary)]/10 p-3">
              <Blocks className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
              프롬프트 분해
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              긴 프롬프트를 13가지 요소로 자동 분해해서 저장하세요. GPT와 Gemini를 지원합니다.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 inline-flex rounded-lg bg-[var(--color-block-lighting)]/10 p-3">
              <Library className="h-6 w-6 text-[var(--color-block-lighting)]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
              블록 라이브러리
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              저장한 블록을 카테고리별로 정리하고, 빠르게 검색해서 재사용하세요.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="mb-4 inline-flex rounded-lg bg-[var(--color-block-style)]/10 p-3">
              <Puzzle className="h-6 w-6 text-[var(--color-block-style)]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
              블록 조립
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              원하는 블록을 선택해서 새로운 프롬프트를 조립하세요. 드래그앤드롭으로 순서 변경도 가능해요.
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[var(--color-text-secondary)]">
          © 2026 PromptBlocks. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
