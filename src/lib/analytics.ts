export type ProductEventType =
  | 'dashboard_visit'
  | 'decompose_success'
  | 'decompose_failed'
  | 'blocks_saved'
  | 'assemble_copied'
  | 'preset_saved'
  | 'share_created'
  | 'library_search';

export interface ProductEvent {
  id: string;
  type: ProductEventType;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface FunnelMetrics {
  signedInOrVisited: number;
  firstDecompose: number;
  firstSave: number;
  firstAssemble: number;
}

export interface ProductAnalyticsSummary {
  totalEvents: number;
  weeklyActiveDays: number;
  decomposeSuccessCount: number;
  decomposeErrorRate: number;
  blocksSavedCount: number;
  copiedPromptCount: number;
  shareCount: number;
  funnel: FunnelMetrics;
}

const STORAGE_KEY = 'promptblocks_product_events';
const MAX_EVENTS = 1000;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getProductEvents(): ProductEvent[] {
  if (!isBrowser()) return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as ProductEvent[];
  } catch {
    return [];
  }
}

export function trackProductEvent(
  type: ProductEventType,
  metadata?: Record<string, string | number | boolean>
): void {
  if (!isBrowser()) return;

  const nextEvent: ProductEvent = {
    id: crypto.randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    metadata,
  };

  const events = getProductEvents();
  events.unshift(nextEvent);

  if (events.length > MAX_EVENTS) {
    events.splice(MAX_EVENTS);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function isWithinLastDays(iso: string, days: number): boolean {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return now - target <= days * 24 * 60 * 60 * 1000;
}

function countUniqueDays(events: ProductEvent[], days: number): number {
  const daysSet = new Set<string>();
  for (const event of events) {
    if (isWithinLastDays(event.createdAt, days)) {
      daysSet.add(event.createdAt.slice(0, 10));
    }
  }
  return daysSet.size;
}

export function getProductAnalyticsSummary(): ProductAnalyticsSummary {
  const events = getProductEvents();

  const decomposeSuccessCount = events.filter((e) => e.type === 'decompose_success').length;
  const decomposeFailedCount = events.filter((e) => e.type === 'decompose_failed').length;
  const decomposeTotal = decomposeSuccessCount + decomposeFailedCount;

  const visited = events.some((e) => e.type === 'dashboard_visit') ? 1 : 0;
  const firstDecompose = decomposeSuccessCount > 0 ? 1 : 0;
  const firstSave = events.some((e) => e.type === 'blocks_saved') ? 1 : 0;
  const firstAssemble = events.some((e) => e.type === 'assemble_copied') ? 1 : 0;

  return {
    totalEvents: events.length,
    weeklyActiveDays: countUniqueDays(events, 7),
    decomposeSuccessCount,
    decomposeErrorRate: decomposeTotal > 0 ? decomposeFailedCount / decomposeTotal : 0,
    blocksSavedCount: events.filter((e) => e.type === 'blocks_saved').length,
    copiedPromptCount: events.filter((e) => e.type === 'assemble_copied').length,
    shareCount: events.filter((e) => e.type === 'share_created').length,
    funnel: {
      signedInOrVisited: visited,
      firstDecompose,
      firstSave,
      firstAssemble,
    },
  };
}
