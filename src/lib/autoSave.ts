// 자동 저장 기능 - Assemble 작업 상태 자동 저장 및 복구
const AUTOSAVE_KEY = 'promptblocks_autosave_assemble';
const AUTOSAVE_INTERVAL = 30000; // 30초

export interface AutoSaveData {
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
  timestamp: number;
  version: number;
}

// 현재 작업 상태를 localStorage에 저장
export function saveAutoSave(data: Omit<AutoSaveData, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return;

  try {
    const saveData: AutoSaveData = {
      ...data,
      timestamp: Date.now(),
      version: 1,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('자동 저장 실패:', error);
  }
}

// 저장된 작업 상태 불러오기
export function loadAutoSave(): AutoSaveData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as AutoSaveData;

    // 7일 이상 된 데이터는 무효로 처리
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > oneWeek) {
      clearAutoSave();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('자동 저장 데이터 로드 실패:', error);
    return null;
  }
}

// 자동 저장 데이터 삭제
export function clearAutoSave(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTOSAVE_KEY);
}

// 자동 저장 데이터가 있는지 확인
export function hasAutoSave(): boolean {
  return loadAutoSave() !== null;
}

// 마지막 저장 시간 포맷팅
export function formatLastSaved(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return '방금 전';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
  return `${Math.floor(diff / 86400000)}일 전`;
}

// 자동 저장 훅을 위한 디바운스 유틸리티
export function createAutoSaveTimer(callback: () => void): {
  trigger: () => void;
  clear: () => void;
} {
  let timer: NodeJS.Timeout | null = null;

  return {
    trigger: () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, AUTOSAVE_INTERVAL);
    },
    clear: () => {
      if (timer) clearTimeout(timer);
    },
  };
}

// 페이지 이탈 시 확인 메시지
export function setupBeforeUnload(blocksExist: boolean): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (blocksExist) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
