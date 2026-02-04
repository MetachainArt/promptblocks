'use client';

import { Check, Star, Trash2, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS, type BlockType } from '@/types';

export interface BlockCardProps {
  blockType: BlockType;
  content: string;
  isSelected?: boolean;
  isFavorite?: boolean;
  selectable?: boolean;
  onToggle?: () => void;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function BlockCard({
  blockType,
  content,
  isSelected = false,
  isFavorite = false,
  selectable = false,
  onToggle,
  onFavoriteToggle,
  onClick,
  onDelete,
  className,
}: BlockCardProps) {
  const colorClass = BLOCK_TYPE_COLORS[blockType];
  const label = BLOCK_TYPE_LABELS[blockType];

  return (
    <Card
      hover
      className={cn(
        'relative cursor-pointer transition-all',
        isSelected && 'ring-2 ring-[var(--color-primary)]',
        className
      )}
      onClick={selectable ? onToggle : onClick}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center rounded px-2 py-1 text-xs font-medium text-white',
            colorClass
          )}
        >
          {label}
        </span>

        <div className="flex items-center gap-2">
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-warning)]"
              title="즐겨찾기"
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-[var(--color-warning)] text-[var(--color-warning)]')} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
              title="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {selectable && (
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                  : 'border-[var(--color-border)]'
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <p className="line-clamp-3 text-sm text-[var(--color-text-secondary)]">{content}</p>
    </Card>
  );
}
