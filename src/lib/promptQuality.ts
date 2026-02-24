export interface QualityIssue {
  level: 'error' | 'warning';
  message: string;
}

export interface PromptQualityResult {
  score: number;
  issues: QualityIssue[];
}

const BLOCK_MIN_LENGTH = 4;
const PROMPT_MIN_LENGTH = 30;
const BAN_WORDS = ['nsfw', 'hate', 'violence'];

export function validateBlockContents(contents: string[]): PromptQualityResult {
  const issues: QualityIssue[] = [];

  const trimmed = contents.map((value) => value.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    return {
      score: 0,
      issues: [{ level: 'error', message: '저장할 블록 내용이 없습니다.' }],
    };
  }

  const tooShort = trimmed.filter((value) => value.length < BLOCK_MIN_LENGTH).length;
  if (tooShort > 0) {
    issues.push({
      level: 'warning',
      message: `너무 짧은 블록이 ${tooShort}개 있습니다.`,
    });
  }

  const duplicateCount = trimmed.length - new Set(trimmed.map((item) => item.toLowerCase())).size;
  if (duplicateCount > 0) {
    issues.push({
      level: 'warning',
      message: `중복 블록이 ${duplicateCount}개 있습니다.`,
    });
  }

  const hasBanned = trimmed.some((value) =>
    BAN_WORDS.some((word) => value.toLowerCase().includes(word))
  );
  if (hasBanned) {
    issues.push({
      level: 'warning',
      message: '민감한 키워드가 포함되어 있습니다. 공유 전 확인해주세요.',
    });
  }

  const score = Math.max(0, 100 - issues.length * 12);
  return { score, issues };
}

export function validateAssembledPrompt(
  prompt: string,
  negativePrompt: string,
  blockCount: number
): PromptQualityResult {
  const issues: QualityIssue[] = [];

  const normalizedPrompt = prompt.trim();
  if (normalizedPrompt.length < PROMPT_MIN_LENGTH) {
    issues.push({
      level: 'warning',
      message: '프롬프트가 너무 짧아 결과 품질이 낮을 수 있습니다.',
    });
  }

  if (blockCount < 3) {
    issues.push({
      level: 'warning',
      message: '블록이 3개 미만입니다. 스타일/조명/구도 블록 추가를 권장합니다.',
    });
  }

  const hasBanned = BAN_WORDS.some((word) => normalizedPrompt.toLowerCase().includes(word));
  if (hasBanned) {
    issues.push({
      level: 'warning',
      message: '민감한 키워드가 포함되어 있습니다.',
    });
  }

  if (!negativePrompt.trim()) {
    issues.push({
      level: 'warning',
      message: 'Negative prompt가 비어 있습니다.',
    });
  }

  const score = Math.max(0, 100 - issues.length * 10);
  return { score, issues };
}
