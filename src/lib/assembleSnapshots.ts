import { type BlockType } from '@/types';

export interface AssembleSnapshot {
  id: string;
  name: string;
  createdAt: string;
  prompt: string;
  negativePrompt: string;
  blocks: Array<{
    id: string;
    blockType: BlockType;
    content: string;
    originalId: string;
  }>;
}

const STORAGE_KEY = 'promptblocks_assemble_snapshots';
const MAX_SNAPSHOTS = 20;

export function getAssembleSnapshots(): AssembleSnapshot[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as AssembleSnapshot[];
  } catch {
    return [];
  }
}

export function saveAssembleSnapshot(
  payload: Omit<AssembleSnapshot, 'id' | 'createdAt'>
): AssembleSnapshot {
  const next: AssembleSnapshot = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const snapshots = getAssembleSnapshots();
    snapshots.unshift(next);
    if (snapshots.length > MAX_SNAPSHOTS) {
      snapshots.splice(MAX_SNAPSHOTS);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }

  return next;
}

export function deleteAssembleSnapshot(id: string): void {
  if (typeof window === 'undefined') return;
  const snapshots = getAssembleSnapshots().filter((snapshot) => snapshot.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
}
