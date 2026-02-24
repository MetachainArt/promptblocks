import { NextRequest, NextResponse } from 'next/server';
import { type DecomposeResult } from '@/types';
import {
  checkRateLimit,
  getAuthenticatedUser,
  rateLimitResponse,
  unauthorizedResponse,
} from '@/lib/auth';

const MAX_BATCH_IMAGES = 5;

interface BatchProgressState {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  percentage: number;
  currentIndex: number;
  currentName: string | null;
  status: 'idle' | 'running' | 'completed';
}

interface NormalizedBatchImage {
  id: string;
  index: number;
  name: string;
  image: string;
}

interface BatchItemBase {
  id: string;
  index: number;
  name: string;
  image: string;
}

interface BatchSuccessItem extends BatchItemBase {
  status: 'success';
  prompt: string;
  result: DecomposeResult;
  error: null;
}

interface BatchErrorItem extends BatchItemBase {
  status: 'error';
  prompt: null;
  result: null;
  error: string;
}

type BatchResultItem = BatchSuccessItem | BatchErrorItem;

interface BatchProgressEvent {
  type: 'progress';
  progress: BatchProgressState;
  item: BatchResultItem;
}

interface BatchCompleteEvent {
  type: 'complete';
  progress: BatchProgressState;
  results: BatchResultItem[];
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function createProgressState(
  total: number,
  completed: number,
  succeeded: number,
  failed: number,
  currentIndex: number,
  currentName: string | null,
  status: 'idle' | 'running' | 'completed'
): BatchProgressState {
  return {
    total,
    completed,
    succeeded,
    failed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
    currentIndex,
    currentName,
    status,
  };
}

function writeEvent(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  event: BatchProgressEvent | BatchCompleteEvent
) {
  controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
}

function normalizeBatchImages(rawImages: unknown): {
  images: NormalizedBatchImage[];
  error: string | null;
} {
  if (!Array.isArray(rawImages)) {
    return { images: [], error: 'images는 배열이어야 합니다.' };
  }

  if (rawImages.length === 0) {
    return { images: [], error: '최소 1장의 이미지를 업로드해주세요.' };
  }

  if (rawImages.length > MAX_BATCH_IMAGES) {
    return {
      images: [],
      error: `이미지는 최대 ${MAX_BATCH_IMAGES}장까지 분석할 수 있습니다.`,
    };
  }

  const normalized: NormalizedBatchImage[] = [];

  for (let i = 0; i < rawImages.length; i += 1) {
    const raw = rawImages[i];

    if (typeof raw === 'string') {
      if (!raw.startsWith('data:image/')) {
        return { images: [], error: `${i + 1}번째 이미지 형식이 올바르지 않습니다.` };
      }

      normalized.push({
        id: `image-${i + 1}`,
        index: i + 1,
        name: `이미지 ${i + 1}`,
        image: raw,
      });
      continue;
    }

    if (!raw || typeof raw !== 'object') {
      return { images: [], error: `${i + 1}번째 이미지 데이터가 비어있습니다.` };
    }

    const candidate = raw as { id?: unknown; image?: unknown; name?: unknown };
    const image = typeof candidate.image === 'string' ? candidate.image : '';

    if (!image.startsWith('data:image/')) {
      return { images: [], error: `${i + 1}번째 이미지 형식이 올바르지 않습니다.` };
    }

    normalized.push({
      id: typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id : `image-${i + 1}`,
      index: i + 1,
      name:
        typeof candidate.name === 'string' && candidate.name.trim()
          ? candidate.name.trim()
          : `이미지 ${i + 1}`,
      image,
    });
  }

  return { images: normalized, error: null };
}

async function analyzeSingleImage(params: {
  request: NextRequest;
  image: NormalizedBatchImage;
  apiKey: string;
  aiProvider: 'gpt' | 'gemini';
  aiModel: string;
  modePreamble?: string;
}): Promise<{ prompt: string; result: DecomposeResult }> {
  const { request, image, apiKey, aiProvider, aiModel, modePreamble } = params;
  const analyzeImageUrl = new URL('/api/analyze-image', request.url);
  const cookieHeader = request.headers.get('cookie');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-AI-Provider': aiProvider,
    'X-AI-Model': aiModel,
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(analyzeImageUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      image: image.image,
      modePreamble,
    }),
    cache: 'no-store',
  });

  let payload: { prompt?: unknown; result?: unknown; error?: unknown } = {};
  try {
    payload = (await response.json()) as { prompt?: unknown; result?: unknown; error?: unknown };
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload.error === 'string' && payload.error.trim()
        ? payload.error
        : `${image.index}번째 이미지 분석에 실패했습니다.`;
    throw new Error(errorMessage);
  }

  if (!payload.result || typeof payload.result !== 'object') {
    throw new Error(`${image.index}번째 이미지 분석 결과가 비어있습니다.`);
  }

  return {
    prompt: typeof payload.prompt === 'string' ? payload.prompt : '',
    result: payload.result as DecomposeResult,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!checkRateLimit(`batch-decompose:${user.id}`, 5)) {
      return rateLimitResponse();
    }

    const apiKey = request.headers.get('X-API-Key');
    const aiProvider = request.headers.get('X-AI-Provider') as 'gpt' | 'gemini';
    const aiModelHeader = request.headers.get('X-AI-Model');

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 401 });
    }

    if (aiProvider !== 'gpt' && aiProvider !== 'gemini') {
      return NextResponse.json({ error: 'AI Provider가 올바르지 않습니다.' }, { status: 400 });
    }

    const body = await request.json();
    const modePreambleRaw =
      typeof body.modePreamble === 'string' ? body.modePreamble.slice(0, 4000) : undefined;
    const { images, error } = normalizeBatchImages(body.images);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const total = images.length;
    const aiModel =
      aiModelHeader || (aiProvider === 'gemini' ? 'gemini-3-flash-preview' : 'gpt-5.2');

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const results: BatchResultItem[] = [];
        let succeeded = 0;
        let failed = 0;

        for (const image of images) {
          let item: BatchResultItem;

          try {
            const analyzed = await analyzeSingleImage({
              request,
              image,
              apiKey,
              aiProvider,
              aiModel,
              modePreamble: modePreambleRaw,
            });

            succeeded += 1;
            item = {
              id: image.id,
              index: image.index,
              name: image.name,
              image: image.image,
              status: 'success',
              prompt: analyzed.prompt,
              result: analyzed.result,
              error: null,
            };
          } catch (error) {
            failed += 1;
            item = {
              id: image.id,
              index: image.index,
              name: image.name,
              image: image.image,
              status: 'error',
              prompt: null,
              result: null,
              error: toErrorMessage(error, `${image.index}번째 이미지 분석에 실패했습니다.`),
            };
          }

          results.push(item);

          const progress = createProgressState(
            total,
            results.length,
            succeeded,
            failed,
            image.index,
            image.name,
            'running'
          );

          writeEvent(controller, encoder, {
            type: 'progress',
            progress,
            item,
          });
        }

        const finalProgress = createProgressState(
          total,
          total,
          succeeded,
          failed,
          total,
          null,
          'completed'
        );

        writeEvent(controller, encoder, {
          type: 'complete',
          progress: finalProgress,
          results,
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    console.error('Batch decompose error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '배치 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
