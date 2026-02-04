// 프리셋 저장/로드 유틸리티 (Supabase + localStorage 폴백)
import { type Block, type Preset, type PresetBlock } from '@/types';
import { createClient } from '@/lib/supabase/client';

const PRESETS_KEY = 'promptblocks_presets';

// 프리셋 + 블록 정보 타입
export interface PresetWithBlocks extends Preset {
  blocks: Array<{
    id: string;
    blockType: string;
    content: string;
    orderIndex: number;
  }>;
}

// snake_case → camelCase 변환
function toCamelCase(preset: Record<string, unknown>): Preset {
  return {
    id: preset.id as string,
    userId: preset.user_id as string,
    name: preset.name as string,
    description: (preset.description as string) || null,
    isPublic: preset.is_public as boolean,
    createdAt: preset.created_at as string,
  };
}

// ============ localStorage 폴백 (비로그인용) ============

interface LocalPreset {
  id: string;
  name: string;
  blocks: Array<{
    id: string;
    blockType: string;
    content: string;
    originalId: string;
  }>;
  createdAt: string;
}

function getLocalPresets(): LocalPreset[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRESETS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalPreset(name: string, blocks: Array<{ blockType: string; content: string; originalId: string }>): LocalPreset {
  const presets = getLocalPresets();
  const newPreset: LocalPreset = {
    id: crypto.randomUUID(),
    name,
    blocks: blocks.map((b, i) => ({ ...b, id: crypto.randomUUID() })),
    createdAt: new Date().toISOString(),
  };
  presets.unshift(newPreset);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  return newPreset;
}

function deleteLocalPreset(id: string): void {
  const presets = getLocalPresets();
  const filtered = presets.filter((p) => p.id !== id);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
}

// ============ Supabase 메인 함수들 ============

// 현재 사용자 ID 가져오기
async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// 모든 프리셋 가져오기
export async function getPresets(): Promise<Preset[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    // 비로그인: localStorage 프리셋을 Preset 형태로 변환
    return getLocalPresets().map((p) => ({
      id: p.id,
      userId: 'local-user',
      name: p.name,
      description: null,
      isPublic: false,
      createdAt: p.createdAt,
    }));
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('프리셋 로드 실패:', error);
    return [];
  }

  return (data || []).map(toCamelCase);
}

// 프리셋 상세 (블록 포함)
export async function getPresetWithBlocks(presetId: string): Promise<PresetWithBlocks | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    // 비로그인: localStorage에서 가져오기
    const preset = getLocalPresets().find((p) => p.id === presetId);
    if (!preset) return null;

    return {
      id: preset.id,
      userId: 'local-user',
      name: preset.name,
      description: null,
      isPublic: false,
      createdAt: preset.createdAt,
      blocks: preset.blocks.map((b, i) => ({
        id: b.id,
        blockType: b.blockType,
        content: b.content,
        orderIndex: i,
      })),
    };
  }

  const supabase = createClient();

  // 프리셋 정보
  const { data: preset, error: presetError } = await supabase
    .from('presets')
    .select('*')
    .eq('id', presetId)
    .single();

  if (presetError || !preset) return null;

  // 프리셋 블록들 (블록 정보 포함)
  const { data: presetBlocks, error: blocksError } = await supabase
    .from('preset_blocks')
    .select(`
      order_index,
      blocks (
        id,
        block_type,
        content
      )
    `)
    .eq('preset_id', presetId)
    .order('order_index');

  if (blocksError) {
    console.error('프리셋 블록 로드 실패:', blocksError);
    return null;
  }

  return {
    ...toCamelCase(preset),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks: (presetBlocks || []).map((pb: any) => ({
      id: pb.blocks?.id || pb.block_id,
      blockType: pb.blocks?.block_type || '',
      content: pb.blocks?.content || '',
      orderIndex: pb.order_index,
    })),
  };
}

// 프리셋 저장
export async function savePreset(
  name: string,
  blockIds: string[],
  description?: string
): Promise<Preset | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    // 비로그인: localStorage에 저장 (블록 ID 대신 내용을 저장해야 함)
    // 이 경우 호출하는 쪽에서 블록 내용을 전달해야 함
    console.warn('비로그인 상태에서는 savePresetWithBlocks를 사용하세요.');
    return null;
  }

  const supabase = createClient();

  // 프리셋 생성
  const { data: preset, error: presetError } = await supabase
    .from('presets')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      is_public: false,
    })
    .select()
    .single();

  if (presetError || !preset) {
    console.error('프리셋 저장 실패:', presetError);
    return null;
  }

  // 프리셋-블록 연결
  const presetBlocksData = blockIds.map((blockId, index) => ({
    preset_id: preset.id,
    block_id: blockId,
    order_index: index,
  }));

  const { error: blocksError } = await supabase
    .from('preset_blocks')
    .insert(presetBlocksData);

  if (blocksError) {
    console.error('프리셋 블록 연결 실패:', blocksError);
    // 프리셋 삭제 롤백
    await supabase.from('presets').delete().eq('id', preset.id);
    return null;
  }

  return toCamelCase(preset);
}

// 프리셋 저장 (블록 내용 직접 전달 - 비로그인용)
export async function savePresetWithBlocks(
  name: string,
  blocks: Array<{ blockType: string; content: string; originalId: string }>
): Promise<Preset | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    const localPreset = saveLocalPreset(name, blocks);
    return {
      id: localPreset.id,
      userId: 'local-user',
      name: localPreset.name,
      description: null,
      isPublic: false,
      createdAt: localPreset.createdAt,
    };
  }

  // 로그인 상태면 블록 ID로 저장
  const blockIds = blocks.map((b) => b.originalId);
  return savePreset(name, blockIds);
}

// 프리셋 삭제
export async function deletePreset(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    deleteLocalPreset(id);
    return;
  }

  const supabase = createClient();

  // preset_blocks는 CASCADE로 자동 삭제됨
  const { error } = await supabase
    .from('presets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('프리셋 삭제 실패:', error);
    deleteLocalPreset(id);
  }
}

// localStorage 프리셋 블록 가져오기 (비로그인 전용)
export function getLocalPresetBlocks(presetId: string): Array<{
  id: string;
  blockType: string;
  content: string;
  originalId: string;
}> | null {
  const preset = getLocalPresets().find((p) => p.id === presetId);
  return preset?.blocks || null;
}
