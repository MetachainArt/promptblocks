// 사용자 설정 저장/로드 유틸리티 (Supabase + localStorage 폴백)
import { createClient } from '@/lib/supabase/client';

const SETTINGS_KEYS = {
  openaiKey: 'openai_api_key',
  geminiKey: 'gemini_api_key',
  preferredAi: 'preferred_ai',
} as const;

export interface UserSettings {
  openaiKey: string | null;
  geminiKey: string | null;
  preferredAi: 'gpt' | 'gemini';
}

// ============ localStorage 폴백 (비로그인용) ============

function getLocalSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return { openaiKey: null, geminiKey: null, preferredAi: 'gpt' };
  }
  
  return {
    openaiKey: localStorage.getItem(SETTINGS_KEYS.openaiKey),
    geminiKey: localStorage.getItem(SETTINGS_KEYS.geminiKey),
    preferredAi: (localStorage.getItem(SETTINGS_KEYS.preferredAi) as 'gpt' | 'gemini') || 'gpt',
  };
}

function saveLocalSetting(key: keyof typeof SETTINGS_KEYS, value: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (value === null) {
    localStorage.removeItem(SETTINGS_KEYS[key]);
  } else {
    localStorage.setItem(SETTINGS_KEYS[key], value);
  }
}

// ============ Supabase 메인 함수들 ============

// 현재 사용자 ID 가져오기
async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// 설정 가져오기
export async function getUserSettings(): Promise<UserSettings> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return getLocalSettings();
  }

  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('preferred_ai, openai_api_key, gemini_api_key')
      .eq('user_id', userId)
      .single();

    // 에러가 있거나 데이터가 없으면 로컬 설정 사용
    // PGRST116 = row not found, 42703 = column does not exist
    if (error || !data) {
      // 컬럼이 없거나 row가 없는 경우는 조용히 폴백
      if (error?.code !== 'PGRST116' && error?.code !== '42703') {
        console.warn('설정 로드 중 폴백:', error?.message);
      }
      return getLocalSettings();
    }

    return {
      openaiKey: data.openai_api_key || null,
      geminiKey: data.gemini_api_key || null,
      preferredAi: data.preferred_ai || 'gpt',
    };
  } catch (e) {
    // 예상치 못한 에러 시 로컬 설정 사용
    return getLocalSettings();
  }
}

// OpenAI API 키 저장
export async function saveOpenaiKey(key: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    saveLocalSetting('openaiKey', key);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update({ openai_api_key: key })
    .eq('user_id', userId);

  if (error) {
    console.error('OpenAI 키 저장 실패:', error);
    saveLocalSetting('openaiKey', key);
  }

  return !error;
}

// Gemini API 키 저장
export async function saveGeminiKey(key: string): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    saveLocalSetting('geminiKey', key);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update({ gemini_api_key: key })
    .eq('user_id', userId);

  if (error) {
    console.error('Gemini 키 저장 실패:', error);
    saveLocalSetting('geminiKey', key);
  }

  return !error;
}

// 기본 AI 저장
export async function savePreferredAi(ai: 'gpt' | 'gemini'): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    saveLocalSetting('preferredAi', ai);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update({ preferred_ai: ai })
    .eq('user_id', userId);

  if (error) {
    console.error('기본 AI 저장 실패:', error);
    saveLocalSetting('preferredAi', ai);
  }

  return !error;
}

// OpenAI API 키 삭제
export async function deleteOpenaiKey(): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    saveLocalSetting('openaiKey', null);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update({ openai_api_key: null })
    .eq('user_id', userId);

  if (error) {
    console.error('OpenAI 키 삭제 실패:', error);
    saveLocalSetting('openaiKey', null);
  }

  return !error;
}

// Gemini API 키 삭제
export async function deleteGeminiKey(): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    saveLocalSetting('geminiKey', null);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .update({ gemini_api_key: null })
    .eq('user_id', userId);

  if (error) {
    console.error('Gemini 키 삭제 실패:', error);
    saveLocalSetting('geminiKey', null);
  }

  return !error;
}

// API 키 가져오기 (분석 페이지용)
export async function getApiKey(provider: 'gpt' | 'gemini'): Promise<string | null> {
  const settings = await getUserSettings();
  return provider === 'gpt' ? settings.openaiKey : settings.geminiKey;
}
