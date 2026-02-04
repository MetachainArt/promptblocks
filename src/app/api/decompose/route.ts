import { NextRequest, NextResponse } from 'next/server';
import { BLOCK_TYPES, type BlockType, type DecomposeResult } from '@/types';

const SYSTEM_PROMPT = `당신은 이미지 생성 프롬프트 분석 전문가입니다.
주어진 프롬프트를 다음 13가지 요소로 분해하세요. 각 요소가 프롬프트에 없으면 빈 문자열로 반환하세요.

1. subject_type: 주제 유형 (인물, 풍경, 오브젝트 등)
2. style: 스타일 (photorealistic, anime, cinematic 등)
3. appearance: 인물 외형 (얼굴, 피부, 헤어, 체형, 인종)
4. outfit: 의상 (소재, 핏, 레이어링)
5. pose_expression: 포즈와 표정
6. props_objects: 소품과 오브젝트
7. background_environment: 배경과 환경
8. lighting: 조명
9. camera_lens: 카메라와 렌즈
10. color_mood: 색감과 분위기
11. text_in_image: 이미지 내 텍스트
12. composition: 구도
13. tech_params: 기술 파라미터 (--ar, seed 등)

반드시 다음 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "subject_type": "...",
  "style": "...",
  "appearance": "...",
  "outfit": "...",
  "pose_expression": "...",
  "props_objects": "...",
  "background_environment": "...",
  "lighting": "...",
  "camera_lens": "...",
  "color_mood": "...",
  "text_in_image": "...",
  "composition": "...",
  "tech_params": "..."
}`;

async function decomposeWithGPT(prompt: string, apiKey: string): Promise<DecomposeResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `다음 프롬프트를 분해해주세요:\n\n${prompt}` },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 오류');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI 응답이 비어있습니다.');
  }

  return parseResult(content);
}

async function decomposeWithGemini(prompt: string, apiKey: string): Promise<DecomposeResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\n다음 프롬프트를 분해해주세요:\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 오류');
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('AI 응답이 비어있습니다.');
  }

  return parseResult(content);
}

function parseResult(content: string): DecomposeResult {
  // JSON 부분만 추출
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // 결과 검증 및 정리
    const result: DecomposeResult = {} as DecomposeResult;
    for (const type of BLOCK_TYPES) {
      result[type] = typeof parsed[type] === 'string' ? parsed[type].trim() : '';
    }

    return result;
  } catch (e) {
    throw new Error('JSON 파싱에 실패했습니다.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const aiProvider = request.headers.get('X-AI-Provider') as 'gpt' | 'gemini';

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 });
    }

    let result: DecomposeResult;

    if (aiProvider === 'gemini') {
      result = await decomposeWithGemini(prompt, apiKey);
    } else {
      result = await decomposeWithGPT(prompt, apiKey);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Decompose error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '분해에 실패했습니다.' },
      { status: 500 }
    );
  }
}
