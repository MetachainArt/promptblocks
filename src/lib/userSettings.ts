// 사용자 설정 저장/로드 유틸리티 (Supabase + localStorage 폴백)
import { createClient } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/shared';

const SETTINGS_KEYS = {
  openaiKey: 'openai_api_key',
  geminiKey: 'gemini_api_key',
  preferredAi: 'preferred_ai',
  identityAnchor: 'face_identity_anchor',
  identityEnabled: 'face_identity_enabled',
  identityReferenceImage: 'face_identity_reference_image',
  identityReferenceWeight: 'face_identity_reference_weight',
  identityAutoApply: 'face_identity_auto_apply',
} as const;

export interface UserSettings {
  openaiKey: string | null;
  geminiKey: string | null;
  preferredAi: 'gpt' | 'gemini';
  identityAnchor: string;
  identityEnabled: boolean;
  identityReferenceImage: string | null;
  identityReferenceWeight: number;
  identityAutoApply: boolean;
}

export interface IdentitySettings {
  identityAnchor: string;
  identityEnabled: boolean;
  identityReferenceImage: string | null;
  identityReferenceWeight: number;
  identityAutoApply: boolean;
}

function normalizeIdentityWeight(value: number): number {
  if (!Number.isFinite(value)) return 0.75;
  return Math.max(0, Math.min(1, value));
}

// ============ localStorage 폴백 (비로그인용) ============

function getLocalSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return {
      openaiKey: null,
      geminiKey: null,
      preferredAi: 'gpt',
      identityAnchor: '',
      identityEnabled: false,
      identityReferenceImage: null,
      identityReferenceWeight: 0.75,
      identityAutoApply: true,
    };
  }

  const rawWeight = Number(localStorage.getItem(SETTINGS_KEYS.identityReferenceWeight));

  return {
    openaiKey: localStorage.getItem(SETTINGS_KEYS.openaiKey),
    geminiKey: localStorage.getItem(SETTINGS_KEYS.geminiKey),
    preferredAi: (localStorage.getItem(SETTINGS_KEYS.preferredAi) as 'gpt' | 'gemini') || 'gpt',
    identityAnchor: localStorage.getItem(SETTINGS_KEYS.identityAnchor) || '',
    identityEnabled: localStorage.getItem(SETTINGS_KEYS.identityEnabled) === 'true',
    identityReferenceImage: localStorage.getItem(SETTINGS_KEYS.identityReferenceImage),
    identityReferenceWeight: normalizeIdentityWeight(rawWeight),
    identityAutoApply: localStorage.getItem(SETTINGS_KEYS.identityAutoApply) !== 'false',
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

async function upsertUserSettings(
  userId: string,
  patch: Record<string, unknown>
): Promise<{ ok: boolean; errorCode?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });

  if (error) {
    return { ok: false, errorCode: error.code };
  }

  return { ok: true };
}

// ============ Supabase 메인 함수들 ============

// 설정 가져오기
export async function getUserSettings(): Promise<UserSettings> {
  const userId = await getCurrentUserId();
  const localSettings = getLocalSettings();

  if (!userId) {
    return localSettings;
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select(
        'preferred_ai, openai_api_key, gemini_api_key, face_identity_anchor, face_identity_enabled, face_identity_reference_image, face_identity_reference_weight, face_identity_auto_apply'
      )
      .eq('user_id', userId)
      .single();

    // 에러가 있거나 데이터가 없으면 로컬 설정 사용
    // PGRST116 = row not found, 42703 = column does not exist
    if (error || !data) {
      // 컬럼이 없거나 row가 없는 경우는 조용히 폴백
      if (error?.code !== 'PGRST116' && error?.code !== '42703') {
        console.warn('설정 로드 중 폴백:', error?.message);
      }
      return localSettings;
    }

    return {
      openaiKey: data.openai_api_key || localSettings.openaiKey,
      geminiKey: data.gemini_api_key || localSettings.geminiKey,
      preferredAi: data.preferred_ai || localSettings.preferredAi,
      identityAnchor: data.face_identity_anchor || localSettings.identityAnchor,
      identityEnabled:
        typeof data.face_identity_enabled === 'boolean'
          ? data.face_identity_enabled
          : localSettings.identityEnabled,
      identityReferenceImage:
        data.face_identity_reference_image || localSettings.identityReferenceImage,
      identityReferenceWeight: normalizeIdentityWeight(
        Number(data.face_identity_reference_weight ?? localSettings.identityReferenceWeight)
      ),
      identityAutoApply:
        typeof data.face_identity_auto_apply === 'boolean'
          ? data.face_identity_auto_apply
          : localSettings.identityAutoApply,
    };
  } catch {
    // 예상치 못한 에러 시 로컬 설정 사용
    return localSettings;
  }
}

export async function saveIdentitySettings(
  identityAnchor: string,
  identityEnabled: boolean,
  identityReferenceImage: string | null = null,
  identityReferenceWeight: number = 0.75,
  identityAutoApply: boolean = true
): Promise<boolean> {
  const normalizedWeight = normalizeIdentityWeight(identityReferenceWeight);

  saveLocalSetting('identityAnchor', identityAnchor);
  saveLocalSetting('identityEnabled', identityEnabled ? 'true' : 'false');
  saveLocalSetting('identityReferenceImage', identityReferenceImage);
  saveLocalSetting('identityReferenceWeight', String(normalizedWeight));
  saveLocalSetting('identityAutoApply', identityAutoApply ? 'true' : 'false');

  const userId = await getCurrentUserId();
  if (!userId) {
    return true;
  }

  const { ok, errorCode } = await upsertUserSettings(userId, {
    face_identity_anchor: identityAnchor,
    face_identity_enabled: identityEnabled,
    face_identity_reference_image: identityReferenceImage,
    face_identity_reference_weight: normalizedWeight,
    face_identity_auto_apply: identityAutoApply,
  });

  if (!ok) {
    // 컬럼이 아직 없는 환경에서도 localStorage 기반 기능은 동작하도록 유지
    if (errorCode !== '42703') {
      console.warn('얼굴 고정 설정 서버 저장 실패(로컬 저장 유지)');
    }
  }

  return true;
}

export async function getIdentitySettings(): Promise<IdentitySettings> {
  const settings = await getUserSettings();
  return {
    identityAnchor: settings.identityAnchor,
    identityEnabled: settings.identityEnabled,
    identityReferenceImage: settings.identityReferenceImage,
    identityReferenceWeight: settings.identityReferenceWeight,
    identityAutoApply: settings.identityAutoApply,
  };
}

// OpenAI API 키 저장
export async function saveOpenaiKey(key: string): Promise<boolean> {
  const normalized = key.trim();
  saveLocalSetting('openaiKey', normalized);

  const userId = await getCurrentUserId();

  if (!userId) {
    return true;
  }

  const { ok } = await upsertUserSettings(userId, { openai_api_key: normalized });

  if (!ok) {
    console.warn('OpenAI 키 서버 저장 실패(로컬 저장 유지)');
  }

  return true;
}

// Gemini API 키 저장
export async function saveGeminiKey(key: string): Promise<boolean> {
  const normalized = key.trim();
  saveLocalSetting('geminiKey', normalized);

  const userId = await getCurrentUserId();

  if (!userId) {
    return true;
  }

  const { ok } = await upsertUserSettings(userId, { gemini_api_key: normalized });

  if (!ok) {
    console.warn('Gemini 키 서버 저장 실패(로컬 저장 유지)');
  }

  return true;
}

// 기본 AI 저장
export async function savePreferredAi(ai: 'gpt' | 'gemini'): Promise<boolean> {
  saveLocalSetting('preferredAi', ai);

  const userId = await getCurrentUserId();

  if (!userId) {
    return true;
  }

  const { ok } = await upsertUserSettings(userId, { preferred_ai: ai });

  if (!ok) {
    console.warn('기본 AI 서버 저장 실패(로컬 저장 유지)');
  }

  return true;
}

// OpenAI API 키 삭제
export async function deleteOpenaiKey(): Promise<boolean> {
  saveLocalSetting('openaiKey', null);

  const userId = await getCurrentUserId();

  if (!userId) {
    return true;
  }

  const { ok } = await upsertUserSettings(userId, { openai_api_key: null });

  if (!ok) {
    console.warn('OpenAI 키 서버 삭제 실패(로컬 삭제 유지)');
  }

  return true;
}

// Gemini API 키 삭제
export async function deleteGeminiKey(): Promise<boolean> {
  saveLocalSetting('geminiKey', null);

  const userId = await getCurrentUserId();

  if (!userId) {
    return true;
  }

  const { ok } = await upsertUserSettings(userId, { gemini_api_key: null });

  if (!ok) {
    console.warn('Gemini 키 서버 삭제 실패(로컬 삭제 유지)');
  }

  return true;
}

// API 키 가져오기 (분석 페이지용)
export async function getApiKey(provider: 'gpt' | 'gemini'): Promise<string | null> {
  const settings = await getUserSettings();
  return provider === 'gpt' ? settings.openaiKey : settings.geminiKey;
}
