'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { HelpManualModal } from '@/components/ui/HelpManualModal';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  userEmail?: string;
}

export function DashboardLayout({ children, title, userEmail }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('로그아웃에 실패했습니다.');
      return;
    }

    toast.success('로그아웃되었습니다.');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} userEmail={userEmail} />

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-4 pt-16 lg:p-8 lg:ml-72">
        {/* Header */}
        <header className="flex justify-end items-center mb-8 gap-4">
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-purple-500 hover:border-purple-500 transition-colors shadow-sm group"
            title="사용 설명서 보기"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </header>

        {/* Page Content */}
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>

        {/* Help Manual Modal */}
        <HelpManualModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </main>
    </div>
  );
}
