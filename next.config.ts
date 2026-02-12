import type { NextConfig } from "next";

const securityHeaders = [
  {
    // XSS 공격 방지: 외부 스크립트 삽입 차단
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // 클릭재킹 방지: iframe에 사이트가 포함되는 것을 차단
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // HTTPS 연결 강제
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    // Referrer 정보 최소화
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // 브라우저 기능 접근 제어
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
