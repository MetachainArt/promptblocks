'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Blocks } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      setIsLoading(false);
      return;
    }

    toast.success('로그인되었습니다.');
    router.push('/decompose');
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('비밀번호 재설정을 위해 이메일을 입력해주세요.');
      return;
    }
    setIsResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsResetting(false);
    if (error) {
      console.warn('reset password request failed:', error.message);
    }
    toast.success('입력한 이메일로 비밀번호 재설정 안내를 전송했습니다. 메일함을 확인해주세요.');
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="auth-card w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Blocks className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              PromptBlocks
            </span>
          </Link>

          <h1 className="mt-5 text-2xl font-black text-[var(--color-text-primary)]">로그인</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button type="submit" className="mt-1 w-full" isLoading={isLoading}>
            로그인
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
          >
            {isResetting ? '전송 중...' : '이메일로 비밀번호 재설정 링크 받기'}
          </button>
        </div>

        <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-text-secondary)]">
          계속 진행하면{' '}
          <Link href="/terms" className="underline hover:text-[var(--color-primary)]">
            이용약관
          </Link>{' '}
          및{' '}
          <Link href="/privacy" className="underline hover:text-[var(--color-primary)]">
            개인정보처리방침
          </Link>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
