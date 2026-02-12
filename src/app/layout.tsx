import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
};

export const metadata: Metadata = {
  title: {
    default: 'PromptBlocks - AI 이미지 프롬프트 블록 관리 도구',
    template: '%s | PromptBlocks',
  },
  description:
    '이미지 프롬프트를 13가지 요소로 AI가 자동 분해하고, 레고처럼 블록을 조립해 새로운 프롬프트를 만드세요. Midjourney, DALL·E, Stable Diffusion을 위한 프롬프트 매니저.',
  keywords: [
    'AI 프롬프트',
    '이미지 프롬프트',
    '프롬프트 관리',
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    '프롬프트 분해',
    '프롬프트 빌더',
    'AI 이미지 생성',
    'prompt builder',
    'prompt manager',
    'image prompt',
  ],
  authors: [{ name: 'PromptBlocks' }],
  creator: 'PromptBlocks',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://promptblocks.dmssolution.co.kr',
    siteName: 'PromptBlocks',
    title: 'PromptBlocks - AI 이미지 프롬프트를 블록처럼 조립하세요',
    description:
      '이미지 하나를 13가지 프롬프트 요소로 분해하고, 원하는 블록만 골라 새 프롬프트를 조립하세요.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptBlocks - AI 이미지 프롬프트 블록 관리 도구',
    description:
      '이미지 프롬프트를 13가지 요소로 분해하고, 레고처럼 조립해 새 프롬프트를 만드세요.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
