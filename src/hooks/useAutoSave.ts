'use client';

export { formatLastSaved, type AutoSaveData } from '@/lib/autoSave';

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  saveAutoSave,
  loadAutoSave,
  clearAutoSave,
  hasAutoSave,
  formatLastSaved,
  setupBeforeUnload,
  type AutoSaveData,
} from '@/lib/autoSave';

interface UseAutoSaveProps {
  blocks: Array<{
    id: string;
    blockType: string;
    content: string;
    originalId: string;
  }>;
  lockedBlockIds: string[];
  outputMode: string;
  stylePromptMode: string;
  midjourneyParams?: {
    srefCode: string;
    styleWeight: string;
    styleVersion: string;
  };
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  lastSavedAt: number | null;
  hasRecoveredData: boolean;
  recoverData: AutoSaveData | null;
  clearRecoverData: () => void;
  isSaving: boolean;
}

export function useAutoSave({
  blocks,
  lockedBlockIds,
  outputMode,
  stylePromptMode,
  midjourneyParams,
  enabled = true,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [hasRecoveredData, setHasRecoveredData] = useState(false);
  const [recoverData, setRecoverData] = useState<AutoSaveData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // 페이지 로드 시 복구 데이터 확인
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const saved = loadAutoSave();
    if (saved && saved.blocks.length > 0) {
      setHasRecoveredData(true);
      setRecoverData(saved);
    }
  }, [enabled]);

  // 자동 저장 로직
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 변경사항이 있을 때만 저장
    if (blocks.length === 0) {
      clearAutoSave();
      setLastSavedAt(null);
      return;
    }

    // 디바운스 저장
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      saveAutoSave({
        blocks,
        lockedBlockIds,
        outputMode,
        stylePromptMode,
        midjourneyParams,
      });
      setLastSavedAt(Date.now());
      setIsSaving(false);
    }, 2000); // 2초 디바운스

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, lockedBlockIds, outputMode, stylePromptMode, midjourneyParams, enabled]);

  // 페이지 이탈 시 확인
  useEffect(() => {
    if (!enabled) return () => {};
    return setupBeforeUnload(blocks.length > 0);
  }, [blocks.length, enabled]);

  const clearRecoverData = useCallback(() => {
    setHasRecoveredData(false);
    setRecoverData(null);
    clearAutoSave();
  }, []);

  return {
    lastSavedAt,
    hasRecoveredData,
    recoverData,
    clearRecoverData,
    isSaving,
  };
}

// 복구 모달 컴포넌트용 훅
export function useAutoSaveRecovery(onRecover: (data: AutoSaveData) => void) {
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<AutoSaveData | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = loadAutoSave();
    if (saved && saved.blocks.length > 0) {
      setRecoveryData(saved);
      setShowRecoveryModal(true);
    }
  }, []);

  const handleRecover = useCallback(() => {
    if (recoveryData) {
      onRecover(recoveryData);
      toast.success('이전 작업을 복구했습니다');
    }
    setShowRecoveryModal(false);
  }, [recoveryData, onRecover]);

  const handleDiscard = useCallback(() => {
    clearAutoSave();
    setShowRecoveryModal(false);
    toast.info('이전 작업을 삭제했습니다');
  }, []);

  return {
    showRecoveryModal,
    recoveryData,
    handleRecover,
    handleDiscard,
    formatLastSaved: recoveryData ? formatLastSaved(recoveryData.timestamp) : '',
  };
}
