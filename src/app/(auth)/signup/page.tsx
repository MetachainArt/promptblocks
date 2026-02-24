'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Blocks } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.warn('signup failed:', error.message);
      toast.error('회원가입에 실패했습니다. 입력값을 확인하고 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    toast.success('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
    router.push('/login');
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
          <h1 className="mt-5 text-2xl font-black text-[var(--color-text-primary)]">회원가입</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-primary)] hover:underline"
            >
              로그인
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
            placeholder="8자 이상 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호 재입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Button type="submit" className="mt-1 w-full" isLoading={isLoading}>
            회원가입
          </Button>
        </form>

        <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-text-secondary)]">
          회원가입 시{' '}
          <Link href="/terms" className="underline hover:text-[var(--color-primary)]">
            이용약관
          </Link>{' '}
          및{' '}
          <Link href="/privacy" className="underline hover:text-[var(--color-primary)]">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
