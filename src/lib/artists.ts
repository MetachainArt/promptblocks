export type ArtistCategory = 'photographer' | 'illustrator' | 'anime' | 'concept_art' | 'classic';

export interface Artist {
  name: string;
  category: ArtistCategory;
  tags: string[];
  promptFormat: string;
}

export const ARTIST_CATEGORY_LABELS: Record<ArtistCategory, string> = {
  photographer: '사진작가',
  illustrator: '일러스트레이터',
  anime: '애니/만화',
  concept_art: '컨셉 아트',
  classic: '클래식/명화',
};

export const ARTIST_CATEGORY_ICONS: Record<ArtistCategory, string> = {
  photographer: '📷',
  illustrator: '🎨',
  anime: '✨',
  concept_art: '🐉',
  classic: '🖼️',
};

export const ARTISTS: Artist[] = [
  // === 사진작가 ===
  { name: 'Annie Leibovitz', category: 'photographer', tags: ['portrait', 'celebrity', 'editorial', 'dramatic', 'studio', 'photorealistic'], promptFormat: 'photograph by Annie Leibovitz' },
  { name: 'Peter Lindbergh', category: 'photographer', tags: ['fashion', 'black and white', 'portrait', 'editorial', 'monochrome', 'photorealistic'], promptFormat: 'photograph by Peter Lindbergh' },
  { name: 'Brandon Woelfel', category: 'photographer', tags: ['neon', 'bokeh', 'portrait', 'colorful', 'night', 'fairy lights', 'warm'], promptFormat: 'photograph by Brandon Woelfel' },
  { name: 'Helmut Newton', category: 'photographer', tags: ['fashion', 'dramatic', 'bold', 'black and white', 'provocative', 'studio'], promptFormat: 'photograph by Helmut Newton' },
  { name: 'Steve McCurry', category: 'photographer', tags: ['documentary', 'portrait', 'vivid', 'cultural', 'travel', 'photorealistic'], promptFormat: 'photograph by Steve McCurry' },
  { name: 'Tim Walker', category: 'photographer', tags: ['surreal', 'fantasy', 'whimsical', 'fashion', 'colorful', 'dreamy'], promptFormat: 'photograph by Tim Walker' },
  { name: 'Ansel Adams', category: 'photographer', tags: ['landscape', 'black and white', 'nature', 'mountains', 'monochrome', 'dramatic'], promptFormat: 'photograph by Ansel Adams' },
  { name: 'Richard Avedon', category: 'photographer', tags: ['portrait', 'fashion', 'minimalist', 'studio', 'white background', 'editorial'], promptFormat: 'photograph by Richard Avedon' },
  { name: 'Erik Almas', category: 'photographer', tags: ['composite', 'landscape', 'surreal', 'cinematic', 'epic', 'wide shot'], promptFormat: 'photograph by Erik Almas' },
  { name: 'Petra Collins', category: 'photographer', tags: ['dreamy', 'soft', 'pastel', 'feminine', 'portrait', 'ethereal'], promptFormat: 'photograph by Petra Collins' },

  // === 일러스트레이터 ===
  { name: 'Artgerm', category: 'illustrator', tags: ['digital art', 'portrait', 'comic', 'detailed', 'vibrant', 'character', 'fantasy'], promptFormat: 'by Artgerm' },
  { name: 'Loish', category: 'illustrator', tags: ['digital art', 'character', 'colorful', 'cute', 'portrait', 'stylized', 'feminine'], promptFormat: 'by Loish' },
  { name: 'James Jean', category: 'illustrator', tags: ['surreal', 'detailed', 'organic', 'flowing', 'ethereal', 'fine art'], promptFormat: 'by James Jean' },
  { name: 'Victo Ngai', category: 'illustrator', tags: ['editorial', 'colorful', 'detailed', 'narrative', 'pattern', 'cultural'], promptFormat: 'by Victo Ngai' },
  { name: 'Ross Tran', category: 'illustrator', tags: ['digital art', 'character', 'portrait', 'vibrant', 'comic', 'dynamic'], promptFormat: 'by Ross Tran' },
  { name: 'Sachin Teng', category: 'illustrator', tags: ['geometric', 'abstract', 'colorful', 'graphic', 'modern', 'bold'], promptFormat: 'by Sachin Teng' },
  { name: 'Kim Jung Gi', category: 'illustrator', tags: ['ink', 'detailed', 'line art', 'sketch', 'dynamic', 'monochrome'], promptFormat: 'by Kim Jung Gi' },
  { name: 'Magali Villeneuve', category: 'illustrator', tags: ['fantasy', 'portrait', 'realistic', 'detailed', 'character', 'epic'], promptFormat: 'by Magali Villeneuve' },

  // === 애니/만화 ===
  { name: 'Makoto Shinkai', category: 'anime', tags: ['anime', 'landscape', 'sky', 'clouds', 'beautiful', 'detailed', 'cinematic', 'your name'], promptFormat: 'in the style of Makoto Shinkai' },
  { name: 'Studio Ghibli', category: 'anime', tags: ['anime', 'whimsical', 'nature', 'hand drawn', 'warm', 'cozy', 'fantasy', 'miyazaki'], promptFormat: 'in the style of Studio Ghibli' },
  { name: 'Ilya Kuvshinov', category: 'anime', tags: ['anime', 'portrait', 'character', 'digital art', 'cute', 'soft', 'detailed'], promptFormat: 'by Ilya Kuvshinov' },
  { name: 'Yoji Shinkawa', category: 'anime', tags: ['ink', 'mech', 'robot', 'sketch', 'dynamic', 'metal gear', 'concept'], promptFormat: 'by Yoji Shinkawa' },
  { name: 'Akira Toriyama', category: 'anime', tags: ['anime', 'manga', 'character', 'dragon ball', 'dynamic', 'action', 'colorful'], promptFormat: 'in the style of Akira Toriyama' },
  { name: 'Takeshi Obata', category: 'anime', tags: ['manga', 'detailed', 'realistic', 'character', 'dark', 'dramatic', 'death note'], promptFormat: 'in the style of Takeshi Obata' },
  { name: 'Range Murata', category: 'anime', tags: ['anime', 'retro', 'futuristic', 'character', 'fashion', 'stylized', 'pastel'], promptFormat: 'by Range Murata' },
  { name: 'Yoshitaka Amano', category: 'anime', tags: ['fantasy', 'ethereal', 'watercolor', 'flowing', 'final fantasy', 'elegant', 'detailed'], promptFormat: 'by Yoshitaka Amano' },
  { name: 'CLAMP', category: 'anime', tags: ['manga', 'elegant', 'flowing', 'detailed', 'bishonen', 'fantasy', 'romance'], promptFormat: 'in the style of CLAMP' },

  // === 컨셉 아트 ===
  { name: 'Greg Rutkowski', category: 'concept_art', tags: ['fantasy', 'dramatic lighting', 'oil painting', 'epic', 'detailed', 'digital art', 'dark'], promptFormat: 'by Greg Rutkowski' },
  { name: 'Craig Mullins', category: 'concept_art', tags: ['concept art', 'painterly', 'environment', 'cinematic', 'atmospheric', 'landscape'], promptFormat: 'by Craig Mullins' },
  { name: 'Feng Zhu', category: 'concept_art', tags: ['sci-fi', 'environment', 'futuristic', 'concept art', 'industrial', 'mech'], promptFormat: 'by Feng Zhu' },
  { name: 'Wlop', category: 'concept_art', tags: ['fantasy', 'ethereal', 'portrait', 'glowing', 'detailed', 'digital art', 'romantic'], promptFormat: 'by Wlop' },
  { name: 'Beeple', category: 'concept_art', tags: ['sci-fi', 'surreal', '3d', 'futuristic', 'dystopian', 'digital art', 'cinematic'], promptFormat: 'by Beeple' },
  { name: 'Simon Stalenhag', category: 'concept_art', tags: ['sci-fi', 'landscape', 'retro', 'robot', 'suburban', 'atmospheric', 'melancholy'], promptFormat: 'by Simon Stalenhag' },
  { name: 'Syd Mead', category: 'concept_art', tags: ['sci-fi', 'futuristic', 'vehicle', 'architecture', 'retro futurism', 'industrial'], promptFormat: 'by Syd Mead' },
  { name: 'Ian McQue', category: 'concept_art', tags: ['steampunk', 'sketch', 'environment', 'airship', 'industrial', 'detailed'], promptFormat: 'by Ian McQue' },

  // === 클래식/명화 ===
  { name: 'Alphonse Mucha', category: 'classic', tags: ['art nouveau', 'decorative', 'portrait', 'flowing', 'floral', 'elegant', 'poster'], promptFormat: 'in the style of Alphonse Mucha' },
  { name: 'Claude Monet', category: 'classic', tags: ['impressionism', 'landscape', 'nature', 'soft', 'light', 'water', 'garden', 'oil painting'], promptFormat: 'in the style of Claude Monet' },
  { name: 'Vincent van Gogh', category: 'classic', tags: ['post-impressionism', 'swirl', 'bold', 'vibrant', 'texture', 'starry', 'oil painting'], promptFormat: 'in the style of Vincent van Gogh' },
  { name: 'Gustav Klimt', category: 'classic', tags: ['art nouveau', 'gold', 'portrait', 'decorative', 'pattern', 'ornate', 'elegant'], promptFormat: 'in the style of Gustav Klimt' },
  { name: 'Salvador Dali', category: 'classic', tags: ['surreal', 'dreamlike', 'melting', 'bizarre', 'desert', 'symbolic'], promptFormat: 'in the style of Salvador Dali' },
  { name: 'Rembrandt', category: 'classic', tags: ['portrait', 'chiaroscuro', 'dramatic lighting', 'dark', 'oil painting', 'classical', 'baroque'], promptFormat: 'in the style of Rembrandt' },
  { name: 'Hokusai', category: 'classic', tags: ['ukiyo-e', 'wave', 'japanese', 'woodblock', 'nature', 'mountain', 'traditional'], promptFormat: 'in the style of Hokusai' },
  { name: 'J.W. Waterhouse', category: 'classic', tags: ['pre-raphaelite', 'mythology', 'romantic', 'portrait', 'classical', 'ethereal', 'oil painting'], promptFormat: 'in the style of J.W. Waterhouse' },
  { name: 'HR Giger', category: 'classic', tags: ['biomechanical', 'dark', 'alien', 'surreal', 'horror', 'organic', 'industrial'], promptFormat: 'in the style of HR Giger' },
];

/**
 * 현재 블록 내용을 분석하여 관련 작가를 추천
 */
export function getRecommendedArtists(
  blockContents: string[],
  category?: ArtistCategory | 'all',
  excludeNames?: string[]
): Artist[] {
  const allText = blockContents.join(' ').toLowerCase();
  if (!allText.trim()) return [];

  const words = allText.split(/[\s,]+/).filter((w) => w.length > 2);

  const scored = ARTISTS
    .filter((a) => !excludeNames?.includes(a.name))
    .filter((a) => !category || category === 'all' || a.category === category)
    .map((artist) => {
      let score = 0;
      for (const tag of artist.tags) {
        // 정확한 태그 매칭
        if (allText.includes(tag)) {
          score += 3;
        }
        // 단어 단위 부분 매칭
        for (const word of words) {
          if (tag.includes(word) || word.includes(tag)) {
            score += 1;
          }
        }
      }
      return { artist, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map((s) => s.artist);
}
