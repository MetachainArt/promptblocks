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
      redirectTo: `${window.location.origin}/login`,
    });
    setIsResetting(false);
    if (error) {
      toast.error('비밀번호 재설정 이메일 전송에 실패했습니다.');
      return;
    }
    toast.success('비밀번호 재설정 이메일이 발송되었습니다. 메일을 확인해주세요.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Blocks className="h-8 w-8 text-[var(--color-primary)]" />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">PromptBlocks</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--color-text-primary)]">로그인</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-[var(--color-primary)] hover:underline">
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

          <Button type="submit" className="w-full" isLoading={isLoading}>
            로그인
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {isResetting ? '전송 중...' : '비밀번호를 잊으셨나요?'}
          </button>
        </div>
      </div>
    </div>
  );
}
