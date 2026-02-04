// 추천 블록 조립 템플릿
import { type BlockType, BLOCK_TYPE_LABELS } from '@/types';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  blockTypes: BlockType[];
  examplePrompt: string;
}

// 추천 템플릿 목록
export const TEMPLATES: Template[] = [
  {
    id: 'cinematic-portrait',
    name: '시네마틱 인물',
    description: '영화 같은 분위기의 인물 사진',
    icon: '🎬',
    blockTypes: ['subject_type', 'style', 'appearance', 'pose_expression', 'lighting', 'camera_lens', 'color_mood'],
    examplePrompt: 'A woman with long dark hair, cinematic lighting, 35mm film look, soft bokeh background, moody atmosphere',
  },
  {
    id: 'product-photo',
    name: '제품 사진',
    description: '상품 촬영용 깔끔한 구도',
    icon: '📦',
    blockTypes: ['subject_type', 'style', 'background_environment', 'lighting', 'composition', 'tech_params'],
    examplePrompt: 'Minimalist product photography, white background, soft studio lighting, centered composition, 4K resolution',
  },
  {
    id: 'fantasy-art',
    name: '판타지 아트',
    description: '환상적인 장면과 캐릭터',
    icon: '🐉',
    blockTypes: ['subject_type', 'style', 'appearance', 'outfit', 'background_environment', 'lighting', 'color_mood'],
    examplePrompt: 'Epic fantasy scene, magical forest, ethereal glow, detailed character design, vibrant colors',
  },
  {
    id: 'social-profile',
    name: 'SNS 프로필',
    description: '프로필 사진용 자연스러운 연출',
    icon: '📱',
    blockTypes: ['subject_type', 'appearance', 'outfit', 'pose_expression', 'background_environment', 'color_mood'],
    examplePrompt: 'Natural portrait, warm tones, soft smile, casual outfit, blurred city background',
  },
  {
    id: 'architecture',
    name: '건축/인테리어',
    description: '공간과 건축물 촬영',
    icon: '🏛️',
    blockTypes: ['subject_type', 'style', 'background_environment', 'lighting', 'camera_lens', 'composition'],
    examplePrompt: 'Modern interior design, natural daylight, wide angle lens, symmetrical composition, clean lines',
  },
  {
    id: 'food-photo',
    name: '음식 사진',
    description: '맛있어 보이는 음식 촬영',
    icon: '🍔',
    blockTypes: ['subject_type', 'style', 'props_objects', 'lighting', 'color_mood', 'composition'],
    examplePrompt: 'Appetizing food photography, warm lighting, shallow depth of field, rustic table setting, overhead shot',
  },
];

// 템플릿 ID로 가져오기
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

// 템플릿의 블록 타입 라벨 가져오기
export function getTemplateBlockLabels(template: Template): string[] {
  return template.blockTypes.map((type) => BLOCK_TYPE_LABELS[type]);
}

// 블록 타입으로 템플릿 추천
export function getRecommendedTemplates(blockTypes: BlockType[]): Template[] {
  if (blockTypes.length === 0) return TEMPLATES;

  // 사용자의 블록 타입과 겹치는 템플릿 우선
  return TEMPLATES.sort((a, b) => {
    const aMatch = a.blockTypes.filter((t) => blockTypes.includes(t)).length;
    const bMatch = b.blockTypes.filter((t) => blockTypes.includes(t)).length;
    return bMatch - aMatch;
  });
}
