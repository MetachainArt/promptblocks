import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PromptBlocks - 이미지 프롬프트 블록 관리 도구',
  description:
    '이미지 프롬프트를 13가지 요소로 분해하고, 레고처럼 조립해 새 프롬프트를 만드는 도구',
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
