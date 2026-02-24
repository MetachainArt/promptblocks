export interface SharedPromptPayload {
  id: string;
  createdAt: string;
  expiresAt: string;
  prompt: string;
  negativePrompt: string;
  blockCount: number;
  blocks: Array<{
    type: string;
    content: string;
  }>;
}

const STORAGE_KEY = 'promptblocks_shared_prompts';
const TTL_DAYS = 7;

function getAllSharedPrompts(): SharedPromptPayload[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SharedPromptPayload[];
  } catch {
    return [];
  }
}

function saveAllSharedPrompts(payloads: SharedPromptPayload[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payloads));
}

export function createShareLink(
  payload: Omit<SharedPromptPayload, 'id' | 'createdAt' | 'expiresAt'>,
  origin: string
): string {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + TTL_DAYS);

  const next: SharedPromptPayload = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const all = getAllSharedPrompts().filter(
    (item) => new Date(item.expiresAt).getTime() > Date.now()
  );
  all.unshift(next);
  saveAllSharedPrompts(all);

  return `${origin}/share/${next.id}`;
}

export function getShareById(id: string): SharedPromptPayload | null {
  const item = getAllSharedPrompts().find((entry) => entry.id === id);
  if (!item) return null;
  if (new Date(item.expiresAt).getTime() < Date.now()) return null;
  return item;
}
