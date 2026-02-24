'use client';

import React, { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UndoToastContentProps {
  message: string;
  undoLabel: string;
  onUndo: () => void;
  toastId: string | number;
}

// 실행취소 토스트 컴포넌트
function UndoToastContent({ message, undoLabel, onUndo, toastId }: UndoToastContentProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-lg">
      <span className="text-sm text-[var(--color-text-primary)]">{message}</span>
      <button
        onClick={() => {
          onUndo();
          toast.dismiss(toastId);
        }}
        className="text-sm font-bold text-indigo-600 underline hover:text-indigo-800"
      >
        {undoLabel}
      </button>
    </div>
  );
}

interface UndoToastOptions {
  message: string;
  undoLabel?: string;
  onUndo: () => void;
  duration?: number;
}

// 실행취소 토스트 표시
export function showUndoToast({
  message,
  undoLabel = '실행취소',
  onUndo,
  duration = 5000,
}: UndoToastOptions): string | number {
  const toastId = toast.custom(
    (t) => <UndoToastContent message={message} undoLabel={undoLabel} onUndo={onUndo} toastId={t} />,
    {
      duration,
      position: 'bottom-right',
    }
  );
  return toastId;
}

// 블록 삭제 실행취소용 훅
export function useUndoToast() {
  const lastDeletedBlocks = useRef<
    Array<{
      blocks: any[];
      lockedIds: Set<string>;
      timestamp: number;
    }>
  >([]);

  const showDeleteUndo = useCallback(
    (
      deletedBlocks: any[],
      lockedIds: Set<string>,
      onUndo: (blocks: any[], lockedIds: Set<string>) => void
    ) => {
      const deletedData = {
        blocks: [...deletedBlocks],
        lockedIds: new Set(lockedIds),
        timestamp: Date.now(),
      };
      lastDeletedBlocks.current.push(deletedData);

      showUndoToast({
        message: `${deletedBlocks.length}개 블록이 삭제되었습니다`,
        onUndo: () => {
          onUndo(deletedData.blocks, deletedData.lockedIds);
          lastDeletedBlocks.current = lastDeletedBlocks.current.filter(
            (d) => d.timestamp !== deletedData.timestamp
          );
        },
        duration: 5000,
      });
    },
    []
  );

  const showClearUndo = useCallback(
    (
      clearedBlocks: any[],
      lockedIds: Set<string>,
      onUndo: (blocks: any[], lockedIds: Set<string>) => void
    ) => {
      const clearedData = {
        blocks: [...clearedBlocks],
        lockedIds: new Set(lockedIds),
        timestamp: Date.now(),
      };
      lastDeletedBlocks.current.push(clearedData);

      showUndoToast({
        message: '모든 블록이 제거되었습니다',
        onUndo: () => {
          onUndo(clearedData.blocks, clearedData.lockedIds);
          lastDeletedBlocks.current = lastDeletedBlocks.current.filter(
            (d) => d.timestamp !== clearedData.timestamp
          );
        },
        duration: 5000,
      });
    },
    []
  );

  return {
    showDeleteUndo,
    showClearUndo,
  };
}
