'use client';

import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  userEmail?: string;
}

export function Header({ title, userEmail }: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-20 flex h-20 items-center justify-between border-b border-b-0 border-white/5 px-10">
      <h1 className="text-xl font-bold tracking-wide text-white drop-shadow-md">{title}</h1>

      <div className="flex items-center gap-4">
        {/* 알림 버튼 */}
        <button className="relative rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-[var(--color-primary)]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_rgba(244,114,182,0.5)]"></span>
        </button>

        {/* 구분선 */}
        {userEmail && <div className="mx-2 h-6 w-px bg-white/10"></div>}

        {/* 사용자 정보 */}
        {userEmail && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold text-white shadow-lg">
              {userEmail[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300">{userEmail}</span>
          </div>
        )}
      </div>
    </header>
  );
}
