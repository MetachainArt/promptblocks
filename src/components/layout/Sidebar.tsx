'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImageIcon, Library, FolderOpen, Puzzle, Settings, LineChart, Menu, X, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/decompose', label: '프롬프트 분해', icon: ImageIcon },
  { href: '/library', label: '블록 라이브러리', icon: Library },
  { href: '/collections', label: '컬렉션', icon: FolderOpen },
  { href: '/assemble', label: '블록 조립', icon: Puzzle },
  { href: '/analytics', label: '분석', icon: LineChart },
  { href: '/settings', label: '설정', icon: Settings },
  { href: '/docs', label: '사용방법', icon: BookOpen },
];

interface SidebarProps {
  onLogout?: () => void;
  userEmail?: string;
}

export function Sidebar({ onLogout, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-xl border border-[var(--color-border)] bg-white p-2.5 shadow-md shadow-slate-200/70 lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-24 items-center justify-between border-b border-[var(--color-border)] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              PromptBlocks
            </span>
          </div>
          {/* 모바일 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isActive ? 'sidebar-active' : 'sidebar-item'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-[var(--color-border)] p-4">
          {userEmail && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 font-bold text-white">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{userEmail}</p>
                <p className="truncate text-xs font-medium text-gray-400">Studio Plan</p>
              </div>
            </div>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-[var(--color-surface-elevated)] hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
