import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 경로 (로그인 필요)
  const protectedPaths = ['/decompose', '/library', '/assemble', '/collections', '/settings'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // 인증 경로 (로그인 상태면 대시보드로 리다이렉트)
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    // 로그인 필요한 페이지인데 로그인 안됨 → 로그인 페이지로
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    // 로그인/회원가입 페이지인데 이미 로그인됨 → 대시보드로
    const url = request.nextUrl.clone();
    url.pathname = '/decompose';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
