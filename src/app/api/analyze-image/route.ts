import { NextRequest, NextResponse } from 'next/server';
import { BLOCK_TYPES, type DecomposeResult } from '@/types';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/auth';

// Image analysis system prompt - outputs in English
const IMAGE_ANALYSIS_PROMPT = `You are an expert Image Prompt Rewriter specialized in creating high-quality English prompts for AI image generation models (Midjourney, DALL·E, Stable Diffusion, etc.).

Analyze the given image and create an optimized English prompt.

Classification Priority (STRICT ORDER):
1️⃣ Text-focused / Design: posters, book covers, UI screens, logos, typography
2️⃣ Character / Portrait: person or character as visual focus (accurately identify ethnicity)
3️⃣ General Scene: landscapes, objects, architecture, animals, abstract concepts

Required Elements for Portrait/Character Images:
- Appearance: face, skin texture, hairstyle, body type, ethnicity
- Outfit: fabric, fit, layering, condition
- Pose: standing, sitting, walking, gaze direction
- Expression: neutral, focused, calm, intense, joyful, etc.
- Background: indoor/outdoor, bokeh or sharp focus
- Lighting: key light, backlight, natural light, neon

Technical Details to Include:
- Camera angle: low-angle, high-angle, eye-level
- Shot type: close-up, medium shot, wide shot
- Lens: 35mm, 50mm, 85mm, shallow depth of field
- Style: photorealistic, cinematic, anime, etc.

IMPORTANT: ALL block values must be written in ENGLISH only. Do NOT use any other language.

Respond ONLY with the following JSON format:

{
  "prompt": "Write the complete English prompt here",
  "blocks": {
    "subject_type": "Subject type in English",
    "style": "Style description in English",
    "appearance": "Appearance details in English",
    "outfit": "Outfit description in English",
    "pose_expression": "Pose and expression in English",
    "props_objects": "Props and objects in English",
    "background_environment": "Background and environment in English",
    "lighting": "Lighting description in English",
    "camera_lens": "Camera and lens settings in English",
    "color_mood": "Color palette and mood in English",
    "text_in_image": "Text found in image (keep original language if any)",
    "composition": "Composition description in English",
    "tech_params": "Technical parameters in English"
  }
}

If an element is not present in the image, use an empty string.`;

function buildImageAnalysisPrompt(modePreamble?: string): string {
  const normalized = typeof modePreamble === 'string' ? modePreamble.trim() : '';
  if (!normalized) return IMAGE_ANALYSIS_PROMPT;
  return `${normalized}\n\n---\n\n${IMAGE_ANALYSIS_PROMPT}`;
}

async function analyzeWithGPT(
  imageBase64: string,
  apiKey: string,
  model: string,
  analysisPrompt: string
) {
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
            { type: 'text', text: analysisPrompt },
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
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.error?.message || 'OpenAI API 오류');
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error(`OpenAI API 오류: ${text.slice(0, 200)}`);
      throw e;
    }
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

async function analyzeWithGemini(
  imageBase64: string,
  apiKey: string,
  model: string,
  analysisPrompt: string
) {
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
              { text: analysisPrompt },
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
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.error?.message || 'Gemini API 오류');
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error(`Gemini API 오류: ${text.slice(0, 200)}`);
      throw e;
    }
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
  } catch {
    throw new Error('JSON 파싱에 실패했습니다.');
  }
}

const GEMINI_FALLBACKS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
];
const GPT_FALLBACKS = ['gpt-5.2', 'gpt-5-mini', 'gpt-4o'];

export async function POST(request: NextRequest) {
  try {
    // 인증 검증
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Rate Limiting (분당 10회 - 이미지 분석은 비용이 높음)
    if (!checkRateLimit(`analyze:${user.id}`, 10)) {
      return rateLimitResponse();
    }

    const apiKey = request.headers.get('X-API-Key');
    const aiProvider = request.headers.get('X-AI-Provider') as 'gpt' | 'gemini';
    const aiModel =
      request.headers.get('X-AI-Model') ||
      (aiProvider === 'gemini' ? 'gemini-3-flash-preview' : 'gpt-5.2');

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { image, modePreamble } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: '이미지가 필요합니다.' }, { status: 400 });
    }

    const analysisPrompt = buildImageAnalysisPrompt(
      typeof modePreamble === 'string' ? modePreamble.slice(0, 4000) : undefined
    );

    let content: string | null = null;
    const fallbacks = aiProvider === 'gemini' ? GEMINI_FALLBACKS : GPT_FALLBACKS;
    const modelsToTry = [aiModel, ...fallbacks.filter((m) => m !== aiModel)];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        if (aiProvider === 'gemini') {
          content = await analyzeWithGemini(image, apiKey, model, analysisPrompt);
        } else {
          content = await analyzeWithGPT(image, apiKey, model, analysisPrompt);
        }
        if (content) break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const msg = lastError.message.toLowerCase();
        if (
          msg.includes('overloaded') ||
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('rate') ||
          msg.includes('capacity')
        ) {
          console.log(`Model ${model} overloaded, trying fallback...`);
          continue;
        }
        throw lastError;
      }
    }

    if (!content) {
      throw lastError || new Error('AI 응답이 비어있습니다.');
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
