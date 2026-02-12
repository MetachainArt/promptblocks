'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Blocks } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Supabase가 URL의 토큰을 자동 처리하므로 세션 상태 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 토큰 기반 접근인지 확인 (URL에 code 또는 type 파라미터가 있음)
      const hasResetToken = searchParams.get('code') || searchParams.get('type') === 'recovery';
      
      if (session || hasResetToken) {
        setIsValidSession(true);
      }
      setIsChecking(false);
    };

    // Supabase 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setIsChecking(false);
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('새 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast.error('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    toast.success('비밀번호가 변경되었습니다. 로그인해주세요.');
    
    // 로그아웃 후 로그인 페이지로 이동
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-3 text-[var(--color-text-secondary)]">확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
        <div className="w-full max-w-md text-center">
          <Blocks className="h-12 w-12 text-[var(--color-primary)] mx-auto" />
          <h1 className="mt-6 text-xl font-semibold text-[var(--color-text-primary)]">
            유효하지 않은 링크입니다
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
          </p>
          <Link href="/login">
            <Button className="mt-6">로그인 페이지로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Blocks className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">PromptBlocks</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--color-text-primary)]">
            새 비밀번호 설정
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            type="password"
            label="새 비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            type="password"
            label="비밀번호 확인"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            비밀번호 변경
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-3 text-[var(--color-text-secondary)]">로딩 중...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
