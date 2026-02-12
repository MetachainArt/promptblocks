// 블록 저장/로드 유틸리티 (Supabase + localStorage 폴백)
import { type Block, type BlockType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/shared';

const STORAGE_KEY = 'promptblocks_blocks';

// snake_case → camelCase 변환
function toCamelCase(block: Record<string, unknown>): Block {
  return {
    id: block.id as string,
    userId: block.user_id as string,
    promptId: block.prompt_id as string | null,
    collectionId: (block.collection_id as string) || null,
    blockType: block.block_type as BlockType,
    content: block.content as string,
    tags: (block.tags as string[]) || [],
    isFavorite: block.is_favorite as boolean,
    isPublic: block.is_public as boolean,
    createdAt: block.created_at as string,
    updatedAt: block.updated_at as string,
  };
}

// camelCase → snake_case 변환
function toSnakeCase(block: Partial<Block>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (block.userId !== undefined) result.user_id = block.userId;
  if (block.promptId !== undefined) result.prompt_id = block.promptId;
  if (block.collectionId !== undefined) result.collection_id = block.collectionId;
  if (block.blockType !== undefined) result.block_type = block.blockType;
  if (block.content !== undefined) result.content = block.content;
  if (block.tags !== undefined) result.tags = block.tags;
  if (block.isFavorite !== undefined) result.is_favorite = block.isFavorite;
  if (block.isPublic !== undefined) result.is_public = block.isPublic;
  return result;
}

// ============ localStorage 폴백 (비로그인용) ============

function getLocalBlocks(): Block[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalBlock(blockType: BlockType, content: string, promptId?: string, collectionId?: string): Block {
  const blocks = getLocalBlocks();

  const existing = blocks.find(
    (b) => b.blockType === blockType && b.content === content
  );
  if (existing) {
    // 기존 블록이 미분류이고 새 collectionId가 있으면 업데이트
    if (collectionId && !existing.collectionId) {
      existing.collectionId = collectionId;
      existing.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    }
    return existing;
  }

  const newBlock: Block = {
    id: crypto.randomUUID(),
    userId: 'local-user',
    promptId: promptId || null,
    collectionId: collectionId || null,
    blockType,
    content,
    tags: [],
    isFavorite: false,
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  blocks.unshift(newBlock);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  return newBlock;
}

function deleteLocalBlock(id: string): void {
  const blocks = getLocalBlocks();
  const filtered = blocks.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function toggleLocalFavorite(id: string): Block | null {
  const blocks = getLocalBlocks();
  const block = blocks.find((b) => b.id === id);
  if (!block) return null;

  block.isFavorite = !block.isFavorite;
  block.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  return block;
}

function updateLocalBlock(id: string, updates: Partial<Block>): Block | null {
  const blocks = getLocalBlocks();
  const index = blocks.findIndex((b) => b.id === id);
  if (index === -1) return null;

  blocks[index] = {
    ...blocks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  return blocks[index];
}

// ============ Supabase 메인 함수들 ============

// 모든 블록 가져오기
export async function getBlocks(): Promise<Block[]> {
  const userId = await getCurrentUserId();
  
  // 비로그인: localStorage 사용
  if (!userId) {
    return getLocalBlocks();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('블록 로드 실패:', error);
    return getLocalBlocks(); // 에러 시 폴백
  }

  return (data || []).map(toCamelCase);
}

// 블록 저장
export async function saveBlock(
  blockType: BlockType,
  content: string,
  promptId?: string,
  collectionId?: string
): Promise<Block> {
  const userId = await getCurrentUserId();

  // 비로그인: localStorage 사용
  if (!userId) {
    return saveLocalBlock(blockType, content, promptId, collectionId);
  }

  const supabase = createClient();

  // 중복 체크
  const { data: existing } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('block_type', blockType)
    .eq('content', content)
    .single();

  if (existing) {
    // 기존 블록이 미분류이고 새 collectionId가 있으면 업데이트
    if (collectionId && !existing.collection_id) {
      const { data: updated } = await supabase
        .from('blocks')
        .update({ collection_id: collectionId })
        .eq('id', existing.id)
        .select()
        .single();
      if (updated) return toCamelCase(updated);
    }
    return toCamelCase(existing);
  }

  // 새 블록 저장
  const { data, error } = await supabase
    .from('blocks')
    .insert({
      user_id: userId,
      prompt_id: promptId || null,
      collection_id: collectionId || null,
      block_type: blockType,
      content,
      tags: [],
      is_favorite: false,
      is_public: false,
    })
    .select()
    .single();

  if (error) {
    console.error('블록 저장 실패:', error);
    return saveLocalBlock(blockType, content, promptId, collectionId);
  }

  return toCamelCase(data);
}

// 여러 블록 한번에 저장
export async function saveBlocks(
  items: Array<{ blockType: BlockType; content: string }>,
  promptId?: string,
  collectionId?: string
): Promise<Block[]> {
  const savedBlocks: Block[] = [];
  for (const item of items) {
    if (item.content.trim()) {
      const block = await saveBlock(item.blockType, item.content, promptId, collectionId);
      savedBlocks.push(block);
    }
  }
  return savedBlocks;
}

// 블록 삭제
export async function deleteBlock(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    deleteLocalBlock(id);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('블록 삭제 실패:', error);
    deleteLocalBlock(id);
  }
}

// 즐겨찾기 토글
export async function toggleFavorite(id: string): Promise<Block | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return toggleLocalFavorite(id);
  }

  const supabase = createClient();

  // 현재 상태 확인
  const { data: current } = await supabase
    .from('blocks')
    .select('is_favorite')
    .eq('id', id)
    .single();

  if (!current) return null;

  // 토글
  const { data, error } = await supabase
    .from('blocks')
    .update({ is_favorite: !current.is_favorite })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('즐겨찾기 토글 실패:', error);
    return toggleLocalFavorite(id);
  }

  return toCamelCase(data);
}

// 블록 업데이트
export async function updateBlock(
  id: string,
  updates: Partial<Block>
): Promise<Block | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return updateLocalBlock(id, updates);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('blocks')
    .update(toSnakeCase(updates))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('블록 업데이트 실패:', error);
    return updateLocalBlock(id, updates);
  }

  return toCamelCase(data);
}

// 특정 컬렉션의 블록 가져오기 (null = 미분류)
export async function getBlocksByCollection(collectionId: string | null): Promise<Block[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return getLocalBlocks().filter((b) => (b.collectionId || null) === collectionId);
  }

  const supabase = createClient();
  let query = supabase.from('blocks').select('*').eq('user_id', userId);

  if (collectionId === null) {
    query = query.is('collection_id', null);
  } else {
    query = query.eq('collection_id', collectionId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('컬렉션 블록 로드 실패:', error);
    return [];
  }

  return (data || []).map(toCamelCase);
}

// 블록을 다른 컬렉션으로 일괄 이동
export async function moveBlocksToCollection(
  blockIds: string[],
  collectionId: string | null
): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    const blocks = getLocalBlocks();
    for (const block of blocks) {
      if (blockIds.includes(block.id)) {
        block.collectionId = collectionId;
        block.updatedAt = new Date().toISOString();
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('blocks')
    .update({ collection_id: collectionId })
    .in('id', blockIds)
    .eq('user_id', userId);

  if (error) {
    console.error('블록 이동 실패:', error);
  }
}

// 블록 타입별 개수 가져오기
export async function getBlockCountByType(): Promise<Record<BlockType, number>> {
  const blocks = await getBlocks();
  const counts: Record<string, number> = {};
  
  for (const block of blocks) {
    counts[block.blockType] = (counts[block.blockType] || 0) + 1;
  }
  
  return counts as Record<BlockType, number>;
}
