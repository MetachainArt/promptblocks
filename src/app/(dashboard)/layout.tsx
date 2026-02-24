'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/ui';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? undefined);
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <PageLoading />
      </div>
    );
  }

  return <DashboardLayout userEmail={userEmail}>{children}</DashboardLayout>;
}
