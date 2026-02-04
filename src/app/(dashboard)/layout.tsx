'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/ui';

const PAGE_TITLES: Record<string, string> = {
  '/decompose': '프롬프트 분해',
  '/library': '블록 라이브러리',
  '/assemble': '블록 조립',
  '/settings': '설정',
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? undefined);
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const title = PAGE_TITLES[pathname] || 'PromptBlocks';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <PageLoading />
      </div>
    );
  }

  return (
    <DashboardLayout title={title} userEmail={userEmail}>
      {children}
    </DashboardLayout>
  );
}
