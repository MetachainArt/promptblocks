'use client';

import { Modal, Button } from '@/components/ui';
import { RotateCcw, Trash2, Clock, Blocks } from 'lucide-react';
import { type AutoSaveData } from '@/lib/autoSave';

interface AutoSaveRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecover: () => void;
  onDiscard: () => void;
  recoveryData: AutoSaveData | null;
  formattedTime: string;
}

export function AutoSaveRecoveryModal({
  isOpen,
  onClose,
  onRecover,
  onDiscard,
  recoveryData,
  formattedTime,
}: AutoSaveRecoveryModalProps) {
  if (!recoveryData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="이전 작업을 복구하시겠습니까?"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* 복구 정보 */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Blocks className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[var(--color-text-primary)]">저장된 조립 작업</h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Clock className="h-4 w-4" />
                <span>{formattedTime}에 자동 저장됨</span>
              </div>
            </div>
          </div>

          {/* 블록 미리보기 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">블록 수</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {recoveryData.blocks.length}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">잠금된 블록</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {recoveryData.lockedBlockIds.length}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">출력 모드</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {recoveryData.outputMode === 'midjourney' ? 'Midjourney' : '기본'}
              </span>
            </div>
          </div>

          {/* 블록 목록 미리보기 */}
          <div className="mt-4 max-h-32 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-white p-2">
            {recoveryData.blocks.slice(0, 5).map((block, idx) => (
              <div key={idx} className="truncate py-1 text-xs text-[var(--color-text-secondary)]">
                <span className="mr-2 inline-block rounded bg-[var(--color-primary)]/10 px-1.5 py-0.5 font-medium text-[var(--color-primary)]">
                  {block.blockType}
                </span>
                {block.content}
              </div>
            ))}
            {recoveryData.blocks.length > 5 && (
              <p className="py-1 text-center text-xs text-[var(--color-text-tertiary)]">
                외 {recoveryData.blocks.length - 5}개 더...
              </p>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <p className="text-sm text-[var(--color-text-secondary)]">
          브라우저를 닫기 전 작업 내용이 자동 저장되어 있습니다. 복구하지 않으면 영구적으로
          삭제됩니다.
        </p>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onDiscard} className="flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            삭제하기
          </Button>
          <Button variant="primary" onClick={onRecover} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            복구하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
