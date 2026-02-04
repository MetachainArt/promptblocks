// PromptBlocks 타입 정의

// 블록 타입 (13개)
export const BLOCK_TYPES = [
  'subject_type',
  'style',
  'appearance',
  'outfit',
  'pose_expression',
  'props_objects',
  'background_environment',
  'lighting',
  'camera_lens',
  'color_mood',
  'text_in_image',
  'composition',
  'tech_params',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// 블록 타입 한글 라벨
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  subject_type: '주제 유형',
  style: '스타일',
  appearance: '인물 외형',
  outfit: '의상',
  pose_expression: '포즈/표정',
  props_objects: '소품/오브젝트',
  background_environment: '배경/환경',
  lighting: '조명',
  camera_lens: '카메라/렌즈',
  color_mood: '색감/분위기',
  text_in_image: '이미지 내 텍스트',
  composition: '구도',
  tech_params: '기술 파라미터',
};

// 블록 타입별 설명
export const BLOCK_TYPE_DESCRIPTIONS: Record<BlockType, string> = {
  subject_type: '이미지의 주요 피사체 유형 (인물, 풍경, 동물, 제품 등)',
  style: '이미지의 시각적 스타일 (사실적, 애니메이션, 시네마틱 등)',
  appearance: '인물의 외모적 특징 (얼굴, 피부, 머리, 체형, 인종 등)',
  outfit: '착용한 의상과 액세서리 (소재, 핏, 레이어링 등)',
  pose_expression: '자세와 표정 (서 있음, 앉음, 시선, 감정 표현 등)',
  props_objects: '함께 등장하는 소품과 오브젝트들',
  background_environment: '배경 환경 설정 (실내/실외, 장소, 배경 요소 등)',
  lighting: '조명 설정 (자연광, 인공광, 방향, 강도 등)',
  camera_lens: '카메라 앵글과 렌즈 설정 (클로즈업, 와이드샷, 심도 등)',
  color_mood: '색감과 전체적인 분위기 (톤, 채도, 감성 등)',
  text_in_image: '이미지에 포함될 텍스트나 타이포그래피',
  composition: '화면 구도와 배치 (삼등분법, 대칭, 여백 등)',
  tech_params: '기술적 파라미터 (해상도, 비율, 시드값 등)',
};

// 블록 타입별 색상 클래스
export const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
  subject_type: 'bg-[var(--color-block-subject)]',
  style: 'bg-[var(--color-block-style)]',
  appearance: 'bg-[var(--color-block-appearance)]',
  outfit: 'bg-[var(--color-block-outfit)]',
  pose_expression: 'bg-[var(--color-block-pose)]',
  props_objects: 'bg-[var(--color-block-props)]',
  background_environment: 'bg-[var(--color-block-background)]',
  lighting: 'bg-[var(--color-block-lighting)]',
  camera_lens: 'bg-[var(--color-block-camera)]',
  color_mood: 'bg-[var(--color-block-color)]',
  text_in_image: 'bg-[var(--color-block-text)]',
  composition: 'bg-[var(--color-block-composition)]',
  tech_params: 'bg-[var(--color-block-tech)]',
};

// 사용자 플랜
export type UserPlan = 'free' | 'pro';

// AI 프로바이더
export type AIProvider = 'gpt' | 'gemini';

// 사용자
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

// 사용자 설정
export interface UserSettings {
  id: string;
  userId: string;
  preferredAi: AIProvider;
  monthlyDecomposeCount: number;
  monthlyResetAt: string;
}

// 프롬프트
export interface Prompt {
  id: string;
  userId: string;
  originalText: string;
  aiUsed: AIProvider | null;
  createdAt: string;
}

// 블록
export interface Block {
  id: string;
  userId: string;
  promptId: string | null;
  blockType: BlockType;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 프리셋
export interface Preset {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
}

// 프리셋 블록
export interface PresetBlock {
  id: string;
  presetId: string;
  blockId: string;
  orderIndex: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// 분해 결과 타입
export type DecomposeResult = Record<BlockType, string>;

// 플랜 제한
export const PLAN_LIMITS = {
  free: {
    maxBlocks: 50,
    maxDecomposePerMonth: 20,
  },
  pro: {
    maxBlocks: Infinity,
    maxDecomposePerMonth: Infinity,
  },
} as const;
