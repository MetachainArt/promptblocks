// 스마트 자동 태깅 유틸리티

// 색상 키워드 매핑
const COLOR_KEYWORDS: Record<string, string[]> = {
  빨간색: ['red', 'crimson', 'scarlet', 'ruby', 'burgundy'],
  주황색: ['orange', 'amber', 'peach', 'coral', 'tangerine'],
  노란색: ['yellow', 'gold', 'golden', 'lemon', 'mustard'],
  초록색: ['green', 'emerald', 'lime', 'olive', 'sage', 'mint'],
  파란색: ['blue', 'navy', 'sky', 'azure', 'cobalt', 'sapphire'],
  볼라색: ['purple', 'violet', 'lavender', 'plum', 'magenta'],
  분홍색: ['pink', 'rose', 'magenta', 'fuchsia', 'salmon'],
  갈색: ['brown', 'chocolate', 'coffee', 'tan', 'beige', 'bronze'],
  검은색: ['black', 'dark', 'shadow', 'noir', 'ebony'],
  흰색: ['white', 'light', 'bright', 'snow', 'ivory'],
  회색: ['gray', 'grey', 'silver', 'slate', 'charcoal'],
};

// 분위기/무드 키워드
const MOOD_KEYWORDS: Record<string, string[]> = {
  밝은: ['bright', 'light', 'sunny', 'cheerful', 'vibrant', 'luminous'],
  어두운: ['dark', 'dim', 'shadowy', 'moody', 'gloomy', 'ominous'],
  따뜻한: ['warm', 'cozy', 'golden', 'soft', 'gentle', 'tender'],
  차가운: ['cold', 'cool', 'icy', 'frost', 'winter', 'crisp'],
  활기찬: ['energetic', 'dynamic', 'lively', 'vivid', 'bold', 'intense'],
  평화로운: ['peaceful', 'calm', 'serene', 'tranquil', 'relaxing', 'zen'],
  로맨틱: ['romantic', 'dreamy', 'soft', 'gentle', 'ethereal', 'whimsical'],
  미스터리: ['mysterious', 'enigmatic', 'shadowy', 'dark', 'intriguing'],
  미래적: ['futuristic', 'modern', 'sleek', 'high-tech', 'advanced', 'sci-fi'],
  복고풍: ['vintage', 'retro', 'classic', 'nostalgic', 'old-fashioned', 'antique'],
};

// 장르/스타일 키워드
const GENRE_KEYWORDS: Record<string, string[]> = {
  사실적: ['realistic', 'photorealistic', 'lifelike', 'hyperrealistic', 'detailed'],
  애니메이션: ['anime', 'cartoon', 'animated', 'manga', 'toon'],
  판타지: ['fantasy', 'magical', 'enchanted', 'mythical', 'fairy tale'],
  공상과학: ['sci-fi', 'science fiction', 'futuristic', 'space', 'alien'],
  공포: ['horror', 'scary', 'dark', 'creepy', 'spooky', 'haunted'],
  자연: ['nature', 'natural', 'organic', 'wildlife', 'landscape', 'outdoor'],
  도시: ['urban', 'city', 'metropolitan', 'street', 'downtown', 'architecture'],
  초상화: ['portrait', 'headshot', 'face', 'profile', 'close-up'],
  풍경: ['landscape', 'scenery', 'panorama', 'vista', 'view', 'wide shot'],
};

// 구도/침라 키워드
const COMPOSITION_KEYWORDS: Record<string, string[]> = {
  클로즈업: ['close-up', 'macro', 'detail', 'intimate', 'tight shot'],
  원근법: ['depth of field', 'bokeh', 'shallow focus', 'blur background'],
  광각: ['wide angle', 'panoramic', 'expansive', 'broad view'],
  버드아이뷰: ['bird eye view', 'aerial', 'overhead', 'top down', 'drone'],
  로우앵글: ['low angle', 'worm eye view', 'looking up', 'dramatic angle'],
  대칭: ['symmetrical', 'balanced', 'mirror', 'centered', 'even'],
};

export interface AutoTagResult {
  colors: string[];
  moods: string[];
  genres: string[];
  compositions: string[];
  confidence: number;
}

// 텍스트에서 자동으로 태그 추출
export function extractAutoTags(text: string): AutoTagResult {
  const lowerText = text.toLowerCase();
  const result: AutoTagResult = {
    colors: [],
    moods: [],
    genres: [],
    compositions: [],
    confidence: 0,
  };

  // 색상 추출
  Object.entries(COLOR_KEYWORDS).forEach(([korean, englishKeywords]) => {
    if (englishKeywords.some((keyword) => lowerText.includes(keyword))) {
      result.colors.push(korean);
    }
  });

  // 분위기 추출
  Object.entries(MOOD_KEYWORDS).forEach(([korean, englishKeywords]) => {
    if (englishKeywords.some((keyword) => lowerText.includes(keyword))) {
      result.moods.push(korean);
    }
  });

  // 장르 추출
  Object.entries(GENRE_KEYWORDS).forEach(([korean, englishKeywords]) => {
    if (englishKeywords.some((keyword) => lowerText.includes(keyword))) {
      result.genres.push(korean);
    }
  });

  // 구도 추출
  Object.entries(COMPOSITION_KEYWORDS).forEach(([korean, englishKeywords]) => {
    if (englishKeywords.some((keyword) => lowerText.includes(keyword))) {
      result.compositions.push(korean);
    }
  });

  // 신뢰도 계산 (태그 수 기반)
  const totalTags =
    result.colors.length + result.moods.length + result.genres.length + result.compositions.length;
  result.confidence = Math.min(100, totalTags * 15);

  return result;
}

// 추천 태그 생성
export function generateSuggestedTags(existingTags: string[], content: string): string[] {
  const autoTags = extractAutoTags(content);
  const allNewTags = [
    ...autoTags.colors,
    ...autoTags.moods,
    ...autoTags.genres,
    ...autoTags.compositions,
  ];

  // 이미 존재하는 태그 제외
  return allNewTags.filter((tag) => !existingTags.includes(tag));
}

// 태그 클라우드 생성 (빈도 기반)
export function generateTagCloud(
  blocks: Array<{ content: string; tags: string[] }>
): Array<{ tag: string; count: number; category: string }> {
  const tagCounts: Record<string, { count: number; category: string }> = {};

  blocks.forEach((block) => {
    // 기존 태그 카운트
    block.tags.forEach((tag) => {
      if (!tagCounts[tag]) {
        tagCounts[tag] = { count: 0, category: 'user' };
      }
      tagCounts[tag].count++;
    });

    // 자동 추출 태그 카운트
    const autoTags = extractAutoTags(block.content);
    [...autoTags.colors, ...autoTags.moods, ...autoTags.genres, ...autoTags.compositions].forEach(
      (tag) => {
        if (!tagCounts[tag]) {
          let category = 'other';
          if (autoTags.colors.includes(tag)) category = 'color';
          else if (autoTags.moods.includes(tag)) category = 'mood';
          else if (autoTags.genres.includes(tag)) category = 'genre';
          else if (autoTags.compositions.includes(tag)) category = 'composition';

          tagCounts[tag] = { count: 0, category };
        }
        tagCounts[tag].count++;
      }
    );
  });

  return Object.entries(tagCounts)
    .map(([tag, data]) => ({ tag, count: data.count, category: data.category }))
    .sort((a, b) => b.count - a.count);
}

// 태그 기반 유사 블록 찾기
export function findSimilarBlocks(
  targetBlock: { content: string; tags: string[] },
  allBlocks: Array<{ content: string; tags: string[]; id: string }>
): Array<{ id: string; similarity: number }> {
  const targetAutoTags = extractAutoTags(targetBlock.content);
  const targetAllTags = new Set([
    ...targetBlock.tags,
    ...targetAutoTags.colors,
    ...targetAutoTags.moods,
    ...targetAutoTags.genres,
    ...targetAutoTags.compositions,
  ]);

  return allBlocks
    .filter((block) => block.id !== (targetBlock as any).id)
    .map((block) => {
      const blockAutoTags = extractAutoTags(block.content);
      const blockAllTags = new Set([
        ...block.tags,
        ...blockAutoTags.colors,
        ...blockAutoTags.moods,
        ...blockAutoTags.genres,
        ...blockAutoTags.compositions,
      ]);

      // 자카드 유사도 계산
      const intersection = new Set([...targetAllTags].filter((x) => blockAllTags.has(x)));
      const union = new Set([...targetAllTags, ...blockAllTags]);
      const similarity = intersection.size / union.size;

      return { id: block.id, similarity };
    })
    .filter((result) => result.similarity > 0.1)
    .sort((a, b) => b.similarity - a.similarity);
}
