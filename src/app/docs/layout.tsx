'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  BookOpen,
  HelpCircle,
  Layers,
  Lightbulb,
  Menu,
  MessageCircle,
  Settings,
  X,
} from 'lucide-react';
import { useState } from 'react';

const docsNavigation = [
  {
    title: '시작하기',
    icon: BookOpen,
    items: [
      { title: '퀵스타트', href: '/docs/guide/quickstart' },
      { title: 'PromptBlocks 시작하기', href: '/docs/guide/getting-started' },
    ],
  },
  {
    title: 'How-To 가이드',
    icon: Lightbulb,
    items: [
      { title: '이미지에서 프롬프트 추출', href: '/docs/how-to/extract-from-image' },
      { title: '블록 라이브러리 관리', href: '/docs/how-to/manage-library' },
      { title: '프롬프트 조립하기', href: '/docs/how-to/assemble-prompt' },
      { title: '얼굴 일관성 유지', href: '/docs/how-to/face-consistency' },
      { title: 'Midjourney 파라미터', href: '/docs/how-to/midjourney-params' },
      { title: '프리셋 저장/공유', href: '/docs/how-to/save-share-presets' },
    ],
  },
  {
    title: '참조 문서',
    icon: Layers,
    items: [
      { title: '13개 블록 타입', href: '/docs/reference/block-types' },
      { title: '작가 스타일 목록', href: '/docs/reference/artist-styles' },
      { title: '키보드 단축키', href: '/docs/reference/keyboard-shortcuts' },
      { title: '용어집', href: '/docs/reference/glossary' },
    ],
  },
  {
    title: '문제 해결',
    icon: HelpCircle,
    items: [
      { title: '자주 묻는 질문', href: '/docs/troubleshooting/faq' },
      { title: '오류 메시지 해결', href: '/docs/troubleshooting/errors' },
    ],
  },
];

function DocsSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-72',
          'border-r border-[var(--color-border)]',
          'bg-[var(--color-surface)]',
          'transform transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <Link href="/docs" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
            <span className="text-lg font-bold text-[var(--color-text-primary)]">문서</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
          {/* Back to App */}
          <Link
            href="/decompose"
            className="mb-6 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)]"
          >
            <Settings className="h-4 w-4" />
            앱으로 돌아가기
          </Link>

          {/* Nav Sections */}
          <div className="space-y-6">
            {docsNavigation.map((section) => (
              <div key={section.title}>
                <div className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === item.href
                            ? 'bg-[var(--color-primary)]/10 font-medium text-[var(--color-primary)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-[var(--color-border)] pt-4">
            <div className="px-2 text-sm text-[var(--color-text-secondary)]">
              <p className="mb-2 font-medium text-[var(--color-text-primary)]">카카오톡 문의</p>
              <a
                href="https://open.kakao.com/o/sSPHn33g"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:text-[var(--color-text-primary)]"
              >
                <MessageCircle className="h-4 w-4" />
                키보드 단축키 문의
              </a>
              <a
                href="https://open.kakao.com/o/sSPHn33g"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 hover:text-[var(--color-text-primary)]"
              >
                <MessageCircle className="h-4 w-4" />
                그 외 모든 문의
              </a>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Mobile Header */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:left-72">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-semibold text-[var(--color-text-primary)]">PromptBlocks Docs</span>
        </div>
        <div className="hidden lg:block" />
        <Link
          href="/decompose"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90"
        >
          앱으로 이동
        </Link>
      </header>

      {/* Sidebar */}
      <DocsSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:ml-72">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
