import { DocsContent, DocStep, Tip, Warning } from '@/components/docs/DocsContent';
import Link from 'next/link';

export default function QuickstartPage() {
  return (
    <DocsContent
      title="5분 퀵스타트"
      description="5분 만에 PromptBlocks로 첫 프롬프트를 만들어보세요"
    >
      {/* Intro */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          🎯 PromptBlocks란?
        </h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          PromptBlocks는 AI 이미지 생성 프롬프트를 분해하고, 저장하고, 재조합하는 도구입니다.
          Pinterest의 멋진 이미지를 분석하거나, 내 프롬프트를 체계적으로 관리하고 싶을 때
          사용하세요.
        </p>
        <div className="mt-4 text-sm text-[var(--color-text-secondary)]">
          <strong>추천 대상:</strong>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Midjourney, DALL-E, Stable Diffusion 사용자</li>
            <li>프롬프트를 체계적으로 정리하고 싶은 분</li>
            <li>일관된 캐릭터/스타일 이미지를 만들고 싶은 분</li>
          </ul>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          5분만에 시작하기
        </h2>

        <DocStep number={1} title="로그인 (30초)">
          <a href="/login" className="text-[var(--color-primary)] hover:underline">
            로그인 페이지
          </a>
          에서 계정으로 로그인하거나 새 계정을 만드세요.
        </DocStep>

        <DocStep number={2} title="Decompose로 이동 (10초)">
          좌측 메뉴에서 <strong>"Decompose"</strong>를 클릭하세요.
        </DocStep>

        <DocStep number={3} title="이미지 업로드 (1분)">
          <p>
            "이미지를 끌어다 놓으세요" 영역에 분석하고 싶은 이미지를 드래그하거나 클릭해서 파일을
            선택하세요.
          </p>
          <Tip>선명하고 복잡하지 않은 이미지일수록 분석 정확도가 높아집니다.</Tip>
        </DocStep>

        <DocStep number={4} title="AI 분석 실행 (1-2분)">
          <ol className="mt-2 list-inside list-decimal space-y-1 text-[var(--color-text-secondary)]">
            <li>AI 모델 선택 (GPT-5.2 또는 Gemini 3 Pro 추천)</li>
            <li>"이미지 분석 시작" 버튼 클릭</li>
            <li>AI가 이미지를 13개 요소로 분해하는 동안 대기</li>
          </ol>
        </DocStep>

        <DocStep number={5} title="결과 확인 및 저장 (1분)">
          <p>분석이 완료되면 13개 블록이 표시됩니다:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--color-text-secondary)]">
            <li>✅ 마음에 드는 블록을 선택</li>
            <li>📝 필요하면 블록 내용 직접 수정</li>
            <li>💾 "선택한 블록 저장" 버튼 클릭</li>
          </ul>
        </DocStep>

        <DocStep number={6} title="Assemble로 이동 (10초)">
          좌측 메뉴에서 <strong>"Assemble"</strong>를 클릭하세요.
        </DocStep>

        <DocStep number={7} title="블록 조립 (1분)">
          <ol className="mt-2 list-inside list-decimal space-y-1 text-[var(--color-text-secondary)]">
            <li>"블록 추가" 버튼 클릭</li>
            <li>라이브러리에서 원하는 블록 선택</li>
            <li>블록 순서 변경 (드래그앤드롭)</li>
            <li>작가 스타일 추가 (원하는 경우)</li>
          </ol>
        </DocStep>

        <DocStep number={8} title="프롬프트 복사 (10초)">
          <p>완성된 프롬프트 하단의 "복사" 버튼을 클릭하고, Midjourney나 DALL-E에 붙여넣으세요!</p>
        </DocStep>
      </div>

      {/* Core Concepts */}
      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          🧩 핵심 개념 이해하기
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-primary)]">Decompose</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              이미지나 텍스트를 AI가 분석해서 13개 요소(블록)로 쪼갭니다.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-primary)]">Library</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              분핸된 블록을 저장하고 태그, 컬렉션으로 관리합니다.
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-background)] p-4">
            <h3 className="font-semibold text-[var(--color-primary)]">Assemble</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              저장된 블록을 조합해서 새로운 프롬프트를 만듭니다.
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">💡 다음 단계</h2>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          이제 기본 사용법을 익혔습니다! 더 자세한 내용은:
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link
            href="/docs/guide/getting-started"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              PromptBlocks 시작하기
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">핵심 개념 심화 학습</p>
          </Link>
          <Link
            href="/docs/how-to/extract-from-image"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              이미지에서 프롬프트 추출하기
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">상세한 분석 가이드</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-[var(--color-text-primary)]">
          🎨 즐거운 프롬프트 엔지니어링 되세요!
        </p>
      </div>
    </DocsContent>
  );
}
