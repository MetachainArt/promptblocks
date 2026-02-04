'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ImageIcon,
  Library,
  Puzzle,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/decompose', label: '프롬프트 분해', icon: ImageIcon },
  { href: '/library', label: '블록 라이브러리', icon: Library },
  { href: '/assemble', label: '블록 조립', icon: Puzzle },
  { href: '/settings', label: '설정', icon: Settings },
];

interface SidebarProps {
  onLogout?: () => void;
  userEmail?: string;
}

export function Sidebar({ onLogout, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 경로 변경 시 모바일 사이드바 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl bg-white border border-gray-200 p-2.5 shadow-sm"
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
          'fixed top-0 left-0 w-72 h-full z-50 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center transform rotate-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">PromptBlocks</span>
          </div>
          {/* 모바일 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden rounded-lg p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-3 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 rounded-2xl font-semibold transition-all',
                  isActive
                    ? 'sidebar-active'
                    : 'sidebar-item'
                )}
              >
                <Icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-gray-100">
          {userEmail && (
            <div className="flex items-center gap-3 mb-4 px-2 bg-gray-50 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-400 font-medium truncate">Free Plan</p>
              </div>
            </div>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all rounded-xl text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>로그아웃</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
