import { NextRequest, NextResponse } from 'next/server';
import { BLOCK_TYPES, type DecomposeResult } from '@/types';
import { createClient } from '@/lib/supabase/server';

// 사용자 지침 기반 이미지 분석 시스템 프롬프트
const IMAGE_ANALYSIS_PROMPT = `당신은 최상급 Image Prompt Rewriter (이미지 프롬프트 재작성 전문가)입니다.

주어진 이미지를 분석하여 이미지 생성 모델(Midjourney, DALL·E, Stable Diffusion 등)에 최적화된 고품질 영어 이미지 프롬프트를 작성하세요.

분류 및 우선순위 (STRICT ORDER):
1️⃣ 텍스트 중심 / 디자인: 포스터, 책 표지, UI 화면, 로고, 타이포그래피
2️⃣ 인물 / 캐릭터: 사람 또는 캐릭터가 시각적 중심 (인종 정확히 판단)
3️⃣ 일반 장면: 풍경, 사물, 건축, 동물, 추상 개념

인물 이미지 필수 포함 요소:
- 외형: 얼굴, 피부 질감, 헤어스타일, 체형, 인종
- 의상: 소재, 핏, 레이어링, 상태
- 포즈: 서 있음, 앉음, 걷는 중, 시선 방향
- 표정: neutral, focused, calm, intense, joyful 등
- 배경: 실내/실외, 배경 흐림(bokeh) 또는 선명도
- 조명: 키라이트, 백라이트, 자연광, 네온 라이트

기술적 디테일 포함:
- 카메라 앵글: low-angle, high-angle, eye-level
- 샷 타입: close-up, medium shot, wide shot
- 렌즈: 35mm, 50mm, 85mm, shallow depth of field
- 스타일: photorealistic, cinematic, anime 등

이미지를 분석하고 다음 JSON 형식으로만 응답하세요:

{
  "prompt": "여기에 생성된 영어 프롬프트 전체를 작성",
  "blocks": {
    "subject_type": "주제 유형",
    "style": "스타일",
    "appearance": "인물 외형",
    "outfit": "의상",
    "pose_expression": "포즈와 표정",
    "props_objects": "소품과 오브젝트",
    "background_environment": "배경과 환경",
    "lighting": "조명",
    "camera_lens": "카메라와 렌즈",
    "color_mood": "색감과 분위기",
    "text_in_image": "이미지 내 텍스트",
    "composition": "구도",
    "tech_params": "기술 파라미터"
  }
}

해당 요소가 이미지에 없으면 빈 문자열로 작성하세요.`;

async function analyzeWithGPT(imageBase64: string, apiKey: string, model: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_completion_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 오류');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

async function analyzeWithGemini(imageBase64: string, apiKey: string, model: string) {
  // base64에서 data:image/... 부분 제거
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mimeType = imageBase64.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: IMAGE_ANALYSIS_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 오류');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

function parseResult(content: string): { prompt: string; result: DecomposeResult } {
  // JSON 부분만 추출
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const prompt = parsed.prompt || '';
    const blocks = parsed.blocks || {};

    const result: DecomposeResult = {} as DecomposeResult;
    for (const type of BLOCK_TYPES) {
      result[type] = typeof blocks[type] === 'string' ? blocks[type].trim() : '';
    }

    return { prompt, result };
  } catch (e) {
    throw new Error('JSON 파싱에 실패했습니다.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const apiKey = request.headers.get('X-API-Key');
    const aiProvider = request.headers.get('X-AI-Provider') as 'gpt' | 'gemini';
    const aiModel = request.headers.get('X-AI-Model') || (aiProvider === 'gemini' ? 'gemini-3-pro-preview' : 'gpt-5.2');

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: '이미지가 필요합니다.' }, { status: 400 });
    }

    let content: string;

    if (aiProvider === 'gemini') {
      content = await analyzeWithGemini(image, apiKey, aiModel);
    } else {
      content = await analyzeWithGPT(image, apiKey, aiModel);
    }

    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    const { prompt, result } = parseResult(content);

    return NextResponse.json({ prompt, result });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
