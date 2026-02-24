// 한글-영문 변환 유틸리티

interface TranslationMap {
  [key: string]: string;
}

// 자주 사용되는 프롬프트 키워드 한글-영문 매핑
const KEYWORD_MAP: TranslationMap = {
  // 인물 관련
  한국인: 'Korean',
  일본인: 'Japanese',
  중국인: 'Chinese',
  백인: 'Caucasian',
  흑인: 'African',
  남자: 'man',
  여자: 'woman',
  소녀: 'girl',
  소년: 'boy',
  '긴 머리': 'long hair',
  '짧은 머리': 'short hair',
  '갈색 머리': 'brown hair',
  금발: 'blonde hair',
  흑발: 'black hair',
  '붉은 머리': 'red hair',
  '갈색 눈': 'brown eyes',
  '파란 눈': 'blue eyes',
  '초록 눈': 'green eyes',
  웃는: 'smiling',
  진지한: 'serious',
  // 스타일 관련
  사실적인: 'photorealistic',
  애니메이션: 'anime style',
  수채화: 'watercolor',
  유화: 'oil painting',
  '연필 스케치': 'pencil sketch',
  '3d 렌더링': '3d render',
  '픽셀 아트': 'pixel art',
  네온: 'neon',
  복고풍: 'vintage',
  미래적: 'futuristic',
  // 조명 관련
  자연광: 'natural lighting',
  '스튜디오 조명': 'studio lighting',
  '골든 아워': 'golden hour',
  '블루 아워': 'blue hour',
  백라이트: 'backlight',
  측광: 'side lighting',
  '부드러운 조명': 'soft lighting',
  경쾌한: 'dramatic lighting',
  // 배경 관련
  도시: 'cityscape',
  자연: 'nature',
  바다: 'ocean',
  산: 'mountain',
  숲: 'forest',
  사막: 'desert',
  우주: 'space',
  실내: 'indoor',
  야외: 'outdoor',
  // 품질 관련
  고품질: 'high quality',
  고해상도: 'high resolution',
  '8k': '8k resolution',
  '4k': '4k resolution',
  디테일한: 'highly detailed',
  선명한: 'sharp focus',
  전문적인: 'professional',
  // 침라 관련
  초상화: 'portrait',
  전신: 'full body',
  반신: 'half body',
  클로즈업: 'close-up',
  원근법: 'depth of field',
  광각: 'wide angle',
  망원: 'telephoto',
  버드아이뷰: 'bird eye view',
};

// 한글 키워드를 영문으로 변환
export function translateToEnglish(koreanText: string): string {
  let result = koreanText;

  Object.entries(KEYWORD_MAP).forEach(([korean, english]) => {
    const regex = new RegExp(korean, 'gi');
    result = result.replace(regex, english);
  });

  return result;
}

// 영문 키워드를 한글로 변환 (역변환)
export function translateToKorean(englishText: string): string {
  let result = englishText;

  Object.entries(KEYWORD_MAP).forEach(([korean, english]) => {
    const regex = new RegExp(english, 'gi');
    result = result.replace(regex, korean);
  });

  return result;
}

// 자동 감지 후 번환
export function autoTranslate(text: string, targetLanguage: 'ko' | 'en'): string {
  if (targetLanguage === 'en') {
    return translateToEnglish(text);
  }
  return translateToKorean(text);
}

// 텍스트가 주로 한글인지 영어인지 감지
export function detectLanguage(text: string): 'ko' | 'en' {
  const koreanCount = (text.match(/[가-힣]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;

  return koreanCount > englishCount ? 'ko' : 'en';
}

// Decompose 결과의 모든 블록 번환
export function translateDecomposeResult(
  result: Record<string, string>,
  targetLanguage: 'ko' | 'en'
): Record<string, string> {
  const translated: Record<string, string> = {};

  Object.entries(result).forEach(([key, value]) => {
    translated[key] = autoTranslate(value, targetLanguage);
  });

  return translated;
}
