// API 라우트 인증 및 Rate Limiting 유틸리티
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API 라우트에서 현재 로그인한 사용자를 검증합니다.
 * 인증되지 않은 요청은 null을 반환합니다.
 */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 쿠키 설정 불가
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * 인증 실패 응답을 반환합니다.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: '로그인이 필요합니다.' },
    { status: 401 }
  );
}

// ============ Rate Limiting ============

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// 메모리 기반 Rate Limiter (서버리스 환경에서는 인스턴스별로 독립)
const rateLimitMap = new Map<string, RateLimitEntry>();

// 5분 주기로 오래된 항목 정리
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Rate Limiting 검사
 * @param identifier - 사용자 식별자 (user ID)
 * @param maxRequests - 윈도우당 최대 요청 수 (기본: 30)
 * @param windowMs - 시간 윈도우 (기본: 60초)
 * @returns true면 허용, false면 차단
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000
): boolean {
  cleanupExpired();

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return false;
  }

  return true;
}

/**
 * Rate Limit 초과 응답을 반환합니다.
 */
export function rateLimitResponse() {
  return NextResponse.json(
    { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    { status: 429 }
  );
}
