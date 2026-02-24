'use client';

import { useMemo } from 'react';
import { Palette } from 'lucide-react';

interface ColorPaletteProps {
  prompt: string;
}

// 프롬프트에서 색상 추출
function extractColorsFromPrompt(prompt: string): string[] {
  const colorKeywords: Record<string, string> = {
    red: '#DC2626',
    crimson: '#991B1B',
    scarlet: '#EF4444',
    ruby: '#E11D48',
    orange: '#F97316',
    amber: '#F59E0B',
    yellow: '#EAB308',
    gold: '#FFD700',
    green: '#16A34A',
    emerald: '#10B981',
    lime: '#84CC16',
    blue: '#2563EB',
    navy: '#1E3A8A',
    sky: '#0EA5E9',
    azure: '#007FFF',
    purple: '#9333EA',
    violet: '#8B5CF6',
    pink: '#EC4899',
    rose: '#F43F5E',
    brown: '#92400E',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#6B7280',
    grey: '#6B7280',
    silver: '#C0C0C0',
    pastel: '#FFB6C1',
    neon: '#39FF14',
    golden: '#FFD700',
    dark: '#374151',
    light: '#F3F4F6',
    bright: '#FCD34D',
  };

  const foundColors: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  Object.entries(colorKeywords).forEach(([keyword, hex]) => {
    if (lowerPrompt.includes(keyword) && !foundColors.includes(hex)) {
      foundColors.push(hex);
    }
  });

  return foundColors.slice(0, 8); // 최대 8개
}

export function ColorPalette({ prompt }: ColorPaletteProps) {
  const colors = useMemo(() => extractColorsFromPrompt(prompt), [prompt]);

  if (colors.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-[var(--color-primary)]" />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          추출된 색상 팔레트
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <div key={index} className="group relative">
            <div
              className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--color-border)] shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100">
              {color}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
        프롬프트에서 감지된 {colors.length}개의 색상 키워드
      </p>
    </div>
  );
}
