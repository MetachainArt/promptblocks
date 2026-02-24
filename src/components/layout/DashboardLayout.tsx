'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { HelpManualModal } from '@/components/ui/HelpManualModal';
import { toast } from 'sonner';
import { CommandPalette } from './CommandPalette';
import { OnboardingChecklist } from './OnboardingChecklist';
import { getOnboardingState, type OnboardingState } from '@/lib/onboarding';
import { trackProductEvent } from '@/lib/analytics';
import { UsageGauge } from '@/components/ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() =>
    getOnboardingState()
  );

  useEffect(() => {
    trackProductEvent('dashboard_visit');
  }, []);

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
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} userEmail={userEmail} />

      {/* Main Content */}
      <main className="min-h-screen flex-1 p-4 pt-16 lg:ml-72 lg:p-8">
        {/* Header */}
        <header className="mb-7 flex items-center justify-end gap-3 rounded-2xl border border-[var(--color-border)] bg-white/80 p-3 shadow-sm backdrop-blur">
          <UsageGauge />
          <CommandPalette onOpenHelp={() => setIsHelpOpen(true)} />
          <button
            onClick={() => setIsHelpOpen(true)}
            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-gray-400 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600"
            title="사용 설명서 보기"
          >
            <svg
              className="h-6 w-6 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </header>

        {/* Page Content */}
        <div className="mx-auto w-full max-w-6xl">
          <OnboardingChecklist state={onboardingState} onChange={setOnboardingState} />
          {children}
        </div>

        {/* Help Manual Modal */}
        <HelpManualModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </main>
    </div>
  );
}
