// 프롬프트 히스토리 관리 (localStorage 기반)

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  negativePrompt: string;
  blockCount: number;
  copiedAt: string;
  identityUsed: boolean;
}

const STORAGE_KEY = 'promptblocks_prompt_history';
const MAX_HISTORY = 50;

export function getPromptHistory(): PromptHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? (JSON.parse(data) as Partial<PromptHistoryItem>[]) : [];
    return parsed.map((item) => ({
      id: item.id || crypto.randomUUID(),
      prompt: item.prompt || '',
      negativePrompt: item.negativePrompt || '',
      blockCount: item.blockCount || 0,
      copiedAt: item.copiedAt || new Date().toISOString(),
      identityUsed: item.identityUsed === true,
    }));
  } catch {
    return [];
  }
}

export function addPromptHistory(
  prompt: string,
  negativePrompt: string,
  blockCount: number,
  identityUsed = false
): PromptHistoryItem {
  const item: PromptHistoryItem = {
    id: crypto.randomUUID(),
    prompt,
    negativePrompt,
    blockCount,
    copiedAt: new Date().toISOString(),
    identityUsed,
  };

  const history = getPromptHistory();
  history.unshift(item);

  // 최대 50개 유지
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return item;
}

export function deletePromptHistory(id: string): void {
  const history = getPromptHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearPromptHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
