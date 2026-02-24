import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Library,
  Layers3,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Blocks className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              PromptBlocks
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="premium-badge inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Prompt Engineering Workspace
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              프롬프트를 분해하고,
              <br />
              다시 조립해 <span className="text-indigo-600">재현 가능한 결과</span>를 만드세요.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
              PromptBlocks는 프롬프트를 13개 구조 블록으로 분해하고, 블록 라이브러리와 조립 툴로 팀
              단위 실험을 반복할 수 있게 도와줍니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
              >
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-bold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-elevated)]"
              >
                기존 계정 로그인
              </Link>
            </div>

            <div className="mt-8 grid gap-2 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 13요소 자동 분해
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 블록 기반 조합/잠금
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> GPT/Gemini 지원
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 공유 링크/히스토리
              </p>
            </div>
          </div>

          <div className="auth-card p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
              How It Works
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-xs font-bold text-indigo-700">STEP 01</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">프롬프트 분해</p>
                <p className="mt-1 text-xs text-slate-600">
                  이미지 또는 텍스트를 13개 구조 블록으로 정리
                </p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <p className="text-xs font-bold text-sky-700">STEP 02</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">라이브러리 저장</p>
                <p className="mt-1 text-xs text-slate-600">
                  좋은 블록을 컬렉션으로 쌓아 재사용 자산화
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-bold text-emerald-700">STEP 03</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">조립 및 실험</p>
                <p className="mt-1 text-xs text-slate-600">
                  고정/랜덤 조합으로 빠르게 변형 후 결과 비교
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-5 sm:grid-cols-3">
          <article className="auth-card p-6">
            <div className="mb-3 inline-flex rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <Blocks className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">프롬프트 분해</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              긴 프롬프트를 구조 블록으로 분해해 의미 단위로 재사용 가능한 자산을 만듭니다.
            </p>
          </article>

          <article className="auth-card p-6">
            <div className="mb-3 inline-flex rounded-lg bg-sky-100 p-2 text-sky-700">
              <Library className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">블록 라이브러리</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              타입/컬렉션/즐겨찾기 기준으로 검색하고, 잘 먹히는 블록을 팀 표준으로 관리합니다.
            </p>
          </article>

          <article className="auth-card p-6">
            <div className="mb-3 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Puzzle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">조립 워크플로우</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              드래그 순서, 고정 잠금, 무작위 조합, 히스토리/스냅샷으로 실험 반복 속도를 높입니다.
            </p>
          </article>
        </section>

        <section className="auth-card mt-16 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              <div className="mb-2 inline-flex rounded-lg bg-indigo-100 p-2 text-indigo-700">
                <Wand2 className="h-4 w-4" />
              </div>
              <h4 className="font-bold">분석 모드</h4>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Analyze/Search preamble 자동 주입
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              <div className="mb-2 inline-flex rounded-lg bg-sky-100 p-2 text-sky-700">
                <Layers3 className="h-4 w-4" />
              </div>
              <h4 className="font-bold">얼굴 일관성</h4>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                reference/anchor/가중치 + 자동 고정
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              <div className="mb-2 inline-flex rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h4 className="font-bold">운영 안정성</h4>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                가드레일, 품질검증, 정책/보안 페이지
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-center text-sm text-[var(--color-text-secondary)] sm:flex-row">
          <p>© 2026 PromptBlocks. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-[var(--color-primary)] hover:underline">
              이용약관
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[var(--color-primary)] hover:underline">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
