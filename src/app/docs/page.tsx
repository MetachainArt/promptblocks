import Link from 'next/link';
import { BookOpen, Lightbulb, Layers, HelpCircle, ArrowRight } from 'lucide-react';

const docSections = [
  {
    title: '시작하기',
    description: 'PromptBlocks의 기본 개념과 첫 사용법',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-600',
    items: [
      { title: '5분 퀵스타트', href: '/docs/guide/quickstart', desc: '5분만에 첫 프롬프트 만들기' },
      { title: '시작하기', href: '/docs/guide/getting-started', desc: '핵심 개념 이해하기' },
    ],
  },
  {
    title: 'How-To 가이드',
    description: '단계별 실습 가이드',
    icon: Lightbulb,
    color: 'bg-amber-500/10 text-amber-600',
    items: [
      {
        title: '이미지에서 프롬프트 추출',
        href: '/docs/how-to/extract-from-image',
        desc: '이미지를 13개 블록으로 분해',
      },
      {
        title: '블록 라이브러리 관리',
        href: '/docs/how-to/manage-library',
        desc: '태그, 컬렉션으로 정리',
      },
      {
        title: '프롬프트 조립하기',
        href: '/docs/how-to/assemble-prompt',
        desc: '블록 조합으로 완성도 높은 프롬프트',
      },
      {
        title: '얼굴 일관성 유지',
        href: '/docs/how-to/face-consistency',
        desc: '같은 캐릭터 다양한 상황',
      },
      {
        title: 'Midjourney 파라미터',
        href: '/docs/how-to/midjourney-params',
        desc: '--sref, --sw 등 고급 설정',
      },
      {
        title: '프리셋 저장/공유',
        href: '/docs/how-to/save-share-presets',
        desc: '자주 쓰는 조합 저장',
      },
    ],
  },
  {
    title: '참조 문서',
    description: '상세 명세와 레퍼런스',
    icon: Layers,
    color: 'bg-emerald-500/10 text-emerald-600',
    items: [
      {
        title: '13개 블록 타입',
        href: '/docs/reference/block-types',
        desc: '각 블록의 의미와 예시',
      },
      {
        title: '작가 스타일 목록',
        href: '/docs/reference/artist-styles',
        desc: '50+ 스타일 아티스트',
      },
      {
        title: '키보드 단축키',
        href: '/docs/reference/keyboard-shortcuts',
        desc: '작업 효율 향상',
      },
      { title: '용어집', href: '/docs/reference/glossary', desc: '프롬프트 엔지니어링 용어' },
    ],
  },
  {
    title: '문제 해결',
    description: 'FAQ와 오류 해결법',
    icon: HelpCircle,
    color: 'bg-rose-500/10 text-rose-600',
    items: [
      { title: '자주 묻는 질문', href: '/docs/troubleshooting/faq', desc: '30+ Q&A' },
      { title: '오류 메시지 해결', href: '/docs/troubleshooting/errors', desc: '10+ 오류 해결법' },
    ],
  },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
          PromptBlocks 문서
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
          AI 이미지 프롬프트를 체계적으로 관리하는 방법을 알아보세요
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/docs/guide/quickstart"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90"
          >
            5분 퀵스타트
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/decompose"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-background)]"
          >
            앱으로 이동
          </Link>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-8 md:grid-cols-2">
        {docSections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${section.color}`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {section.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{section.description}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-background)]"
                  >
                    <div>
                      <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                        {item.title}
                      </span>
                      <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent p-8 text-center">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          도움이 필요하신가요?
        </h3>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          문서에서 원하는 정보를 찾을 수 없다면 카카오톡 오픈채팅으로 문의하세요
        </p>
        <div className="mt-4 flex flex-col items-center gap-2">
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
      </div>
    </div>
  );
}
