'use client';

import { User, Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  userEmail?: string;
}

export function Header({ title, userEmail }: HeaderProps) {
  return (
    <header className="glass-panel flex h-20 items-center justify-between border-b-0 border-b border-white/5 px-10 sticky top-0 z-20">
      <h1 className="text-xl font-bold text-white tracking-wide drop-shadow-md">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* 알림 버튼 */}
        <button className="relative p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-white/5 rounded-full transition-all duration-300">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent)] rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"></span>
        </button>

        {/* 구분선 */}
        {userEmail && <div className="w-px h-6 bg-white/10 mx-2"></div>}

        {/* 사용자 정보 */}
        {userEmail && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {userEmail[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300">{userEmail}</span>
          </div>
        )}
      </div>
    </header>
  );
}
