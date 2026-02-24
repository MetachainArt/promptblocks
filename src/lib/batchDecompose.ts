import { saveBlocks } from '@/lib/blocks';
import { BLOCK_TYPES, type Block, type BlockType, type DecomposeResult } from '@/types';

export const MAX_BATCH_IMAGES = 5;

export interface BatchImagePayload {
  id: string;
  image: string;
  name: string;
}

export interface BatchProgressState {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  percentage: number;
  currentIndex: number;
  currentName: string | null;
  status: 'idle' | 'running' | 'completed';
}

interface BatchItemBase {
  id: string;
  name: string;
  image: string;
  index: number;
}

export interface BatchDecomposeSuccess extends BatchItemBase {
  status: 'success';
  prompt: string;
  result: DecomposeResult;
  error: null;
}

export interface BatchDecomposeFailure extends BatchItemBase {
  status: 'error';
  prompt: null;
  result: null;
  error: string;
}

export type BatchDecomposeItem = BatchDecomposeSuccess | BatchDecomposeFailure;

export interface BatchProgressEvent {
  type: 'progress';
  progress: BatchProgressState;
  item: BatchDecomposeItem;
}

export interface BatchCompleteEvent {
  type: 'complete';
  progress: BatchProgressState;
  results: BatchDecomposeItem[];
}

type BatchStreamEvent = BatchProgressEvent | BatchCompleteEvent;

export type BatchSelectionMap = Record<string, Set<BlockType>>;

export interface RunBatchDecomposeParams {
  images: BatchImagePayload[];
  apiKey: string;
  aiProvider: 'gpt' | 'gemini';
  aiModel: string;
  modePreamble?: string | null;
  signal?: AbortSignal;
  onProgress?: (progress: BatchProgressState, item?: BatchDecomposeItem) => void;
}

export function createBatchProgressState(total: number): BatchProgressState {
  return {
    total,
    completed: 0,
    succeeded: 0,
    failed: 0,
    percentage: total > 0 ? 0 : 100,
    currentIndex: 0,
    currentName: null,
    status: total > 0 ? 'running' : 'idle',
  };
}

function isBatchProgressEvent(event: BatchStreamEvent): event is BatchProgressEvent {
  return event.type === 'progress';
}

function isBatchCompleteEvent(event: BatchStreamEvent): event is BatchCompleteEvent {
  return event.type === 'complete';
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      return payload.error;
    }
  } catch {
    // ignore JSON parse error
  }

  return `배치 처리 요청에 실패했습니다. (${response.status})`;
}

function parseEventLine(line: string): BatchStreamEvent | null {
  try {
    const parsed = JSON.parse(line) as BatchStreamEvent;
    if (!parsed || (parsed.type !== 'progress' && parsed.type !== 'complete')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function runBatchDecompose(
  params: RunBatchDecomposeParams
): Promise<BatchCompleteEvent> {
  const { images, apiKey, aiProvider, aiModel, modePreamble, signal, onProgress } = params;

  if (images.length === 0) {
    throw new Error('분석할 이미지가 없습니다.');
  }

  if (images.length > MAX_BATCH_IMAGES) {
    throw new Error(`이미지는 최대 ${MAX_BATCH_IMAGES}장까지 분석할 수 있습니다.`);
  }

  const response = await fetch('/api/batch-decompose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-AI-Provider': aiProvider,
      'X-AI-Model': aiModel,
    },
    body: JSON.stringify({
      images: images.map((image) => ({
        id: image.id,
        image: image.image,
        name: image.name,
      })),
      modePreamble: typeof modePreamble === 'string' ? modePreamble : null,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (!response.body) {
    throw new Error('배치 처리 응답 스트림이 비어있습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completedEvent: BatchCompleteEvent | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const event = parseEventLine(line);
      if (!event) continue;

      if (isBatchProgressEvent(event)) {
        onProgress?.(event.progress, event.item);
      } else if (isBatchCompleteEvent(event)) {
        completedEvent = event;
        onProgress?.(event.progress);
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    const trailingEvent = parseEventLine(trailing);
    if (trailingEvent) {
      if (isBatchProgressEvent(trailingEvent)) {
        onProgress?.(trailingEvent.progress, trailingEvent.item);
      } else if (isBatchCompleteEvent(trailingEvent)) {
        completedEvent = trailingEvent;
        onProgress?.(trailingEvent.progress);
      }
    }
  }

  if (!completedEvent) {
    throw new Error('배치 분석 결과를 받지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  return completedEvent;
}

export function createDefaultBatchSelection(results: BatchDecomposeItem[]): BatchSelectionMap {
  const selection: BatchSelectionMap = {};

  for (const item of results) {
    if (item.status !== 'success') continue;
    const selected = BLOCK_TYPES.filter((type) => item.result[type]?.trim());
    selection[item.id] = new Set(selected);
  }

  return selection;
}

export function selectAllBatchBlocks(results: BatchDecomposeItem[]): BatchSelectionMap {
  return createDefaultBatchSelection(results);
}

export function clearBatchSelection(results: BatchDecomposeItem[]): BatchSelectionMap {
  const selection: BatchSelectionMap = {};
  for (const item of results) {
    if (item.status !== 'success') continue;
    selection[item.id] = new Set();
  }
  return selection;
}

export function toggleBatchBlockSelection(
  selectionMap: BatchSelectionMap,
  imageId: string,
  blockType: BlockType
): BatchSelectionMap {
  const next: BatchSelectionMap = { ...selectionMap };
  const current = new Set(next[imageId] ?? []);

  if (current.has(blockType)) {
    current.delete(blockType);
  } else {
    current.add(blockType);
  }

  next[imageId] = current;
  return next;
}

export function selectAllBatchBlocksForImage(
  results: BatchDecomposeItem[],
  selectionMap: BatchSelectionMap,
  imageId: string
): BatchSelectionMap {
  const target = results.find((item) => item.id === imageId && item.status === 'success');
  if (!target || target.status !== 'success') {
    return selectionMap;
  }

  const selected = BLOCK_TYPES.filter((type) => target.result[type]?.trim());
  return {
    ...selectionMap,
    [imageId]: new Set(selected),
  };
}

export function clearBatchBlocksForImage(
  selectionMap: BatchSelectionMap,
  imageId: string
): BatchSelectionMap {
  return {
    ...selectionMap,
    [imageId]: new Set(),
  };
}

export function countSelectedBatchBlocks(
  results: BatchDecomposeItem[],
  selectionMap: BatchSelectionMap
): number {
  let total = 0;

  for (const item of results) {
    if (item.status !== 'success') continue;
    const selected = selectionMap[item.id] ?? new Set<BlockType>();
    for (const type of selected) {
      if (item.result[type]?.trim()) {
        total += 1;
      }
    }
  }

  return total;
}

export function buildBatchBlocksToSave(
  results: BatchDecomposeItem[],
  selectionMap: BatchSelectionMap
): Array<{ blockType: BlockType; content: string }> {
  const blocks: Array<{ blockType: BlockType; content: string }> = [];

  for (const item of results) {
    if (item.status !== 'success') continue;
    const selected = selectionMap[item.id] ?? new Set<BlockType>();

    for (const type of selected) {
      const content = item.result[type]?.trim();
      if (!content) continue;
      blocks.push({ blockType: type, content });
    }
  }

  return blocks;
}

export async function saveBatchSelectedBlocks(
  results: BatchDecomposeItem[],
  selectionMap: BatchSelectionMap,
  collectionId?: string
): Promise<Block[]> {
  const blocksToSave = buildBatchBlocksToSave(results, selectionMap);

  if (blocksToSave.length === 0) {
    return [];
  }

  try {
    return await saveBlocks(blocksToSave, undefined, collectionId);
  } catch (error) {
    throw new Error(toErrorMessage(error, '배치 블록 저장에 실패했습니다.'));
  }
}
