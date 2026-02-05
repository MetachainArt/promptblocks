// 컬렉션 저장/로드 유틸리티 (Supabase + localStorage 폴백)
import { type Collection } from '@/types';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY = 'promptblocks_collections';

// snake_case → camelCase 변환
function toCamelCase(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) || null,
    emoji: (row.emoji as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============ localStorage 폴백 (비로그인용) ============

function getLocalCollections(): Collection[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalCollection(name: string, emoji?: string, description?: string): Collection {
  const collections = getLocalCollections();

  const newCollection: Collection = {
    id: crypto.randomUUID(),
    userId: 'local-user',
    name,
    description: description || null,
    emoji: emoji || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  collections.unshift(newCollection);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  return newCollection;
}

function updateLocalCollection(id: string, updates: { name?: string; emoji?: string; description?: string }): Collection | null {
  const collections = getLocalCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return null;

  if (updates.name !== undefined) collections[index].name = updates.name;
  if (updates.emoji !== undefined) collections[index].emoji = updates.emoji || null;
  if (updates.description !== undefined) collections[index].description = updates.description || null;
  collections[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  return collections[index];
}

function deleteLocalCollection(id: string): void {
  const collections = getLocalCollections();
  const filtered = collections.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // 해당 컬렉션의 블록들을 미분류로 변경
  const blocksKey = 'promptblocks_blocks';
  const blocksData = localStorage.getItem(blocksKey);
  if (blocksData) {
    try {
      const blocks = JSON.parse(blocksData);
      let changed = false;
      for (const block of blocks) {
        if (block.collectionId === id) {
          block.collectionId = null;
          block.updatedAt = new Date().toISOString();
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(blocksKey, JSON.stringify(blocks));
      }
    } catch {
      // ignore
    }
  }
}

// ============ Supabase 메인 함수들 ============

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// 모든 컬렉션 가져오기
export async function getCollections(): Promise<Collection[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return getLocalCollections();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('컬렉션 로드 실패:', error);
    return getLocalCollections();
  }

  return (data || []).map(toCamelCase);
}

// 컬렉션 생성
export async function createCollection(
  name: string,
  emoji?: string,
  description?: string
): Promise<Collection> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return saveLocalCollection(name, emoji, description);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      emoji: emoji || null,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('컬렉션 생성 실패:', error);
    return saveLocalCollection(name, emoji, description);
  }

  return toCamelCase(data);
}

// 컬렉션 수정
export async function updateCollection(
  id: string,
  updates: { name?: string; emoji?: string; description?: string }
): Promise<Collection | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return updateLocalCollection(id, updates);
  }

  const supabase = createClient();
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.emoji !== undefined) updateData.emoji = updates.emoji || null;
  if (updates.description !== undefined) updateData.description = updates.description || null;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('collections')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('컬렉션 수정 실패:', error);
    return updateLocalCollection(id, updates);
  }

  return toCamelCase(data);
}

// 컬렉션 삭제 (블록은 ON DELETE SET NULL로 미분류 처리)
export async function deleteCollection(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    deleteLocalCollection(id);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('컬렉션 삭제 실패:', error);
    deleteLocalCollection(id);
  }
}
