export interface UsageSettings {
  dailyLimit: number;
  monthlyLimit: number;
  warningThreshold: number;
}

export interface UsageSnapshot {
  dailyUsed: number;
  monthlyUsed: number;
  settings: UsageSettings;
}

export interface UsageDecision {
  allowed: boolean;
  reason?: string;
  warning?: string;
  snapshot: UsageSnapshot;
}

interface UsageState {
  dailyDate: string;
  dailyUsed: number;
  monthlyKey: string;
  monthlyUsed: number;
}

const SETTINGS_KEY = 'promptblocks_usage_settings';
const STATE_KEY = 'promptblocks_usage_state';

const DEFAULT_SETTINGS: UsageSettings = {
  dailyLimit: 30,
  monthlyLimit: 400,
  warningThreshold: 0.8,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function getDefaultState(): UsageState {
  return {
    dailyDate: todayKey(),
    dailyUsed: 0,
    monthlyKey: monthKey(),
    monthlyUsed: 0,
  };
}

export function getUsageSettings(): UsageSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = window.localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data) as Partial<UsageSettings>;
    return {
      dailyLimit: parsed.dailyLimit ?? DEFAULT_SETTINGS.dailyLimit,
      monthlyLimit: parsed.monthlyLimit ?? DEFAULT_SETTINGS.monthlyLimit,
      warningThreshold: parsed.warningThreshold ?? DEFAULT_SETTINGS.warningThreshold,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUsageSettings(next: UsageSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function getUsageState(): UsageState {
  if (typeof window === 'undefined') return getDefaultState();

  const base = (() => {
    try {
      const data = window.localStorage.getItem(STATE_KEY);
      if (!data) return getDefaultState();
      return JSON.parse(data) as UsageState;
    } catch {
      return getDefaultState();
    }
  })();

  const next = { ...base };

  if (next.dailyDate !== todayKey()) {
    next.dailyDate = todayKey();
    next.dailyUsed = 0;
  }
  if (next.monthlyKey !== monthKey()) {
    next.monthlyKey = monthKey();
    next.monthlyUsed = 0;
  }

  return next;
}

function saveUsageState(state: UsageState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function getUsageSnapshot(): UsageSnapshot {
  const state = getUsageState();
  const settings = getUsageSettings();
  return {
    dailyUsed: state.dailyUsed,
    monthlyUsed: state.monthlyUsed,
    settings,
  };
}

export function registerUsageCall(): UsageSnapshot {
  const state = getUsageState();
  state.dailyUsed += 1;
  state.monthlyUsed += 1;
  saveUsageState(state);

  return {
    dailyUsed: state.dailyUsed,
    monthlyUsed: state.monthlyUsed,
    settings: getUsageSettings(),
  };
}

export function evaluateUsageDecision(): UsageDecision {
  const snapshot = getUsageSnapshot();
  const { dailyUsed, monthlyUsed, settings } = snapshot;

  if (dailyUsed >= settings.dailyLimit) {
    return {
      allowed: false,
      reason: `일일 호출 한도(${settings.dailyLimit}회)를 초과했습니다.`,
      snapshot,
    };
  }

  if (monthlyUsed >= settings.monthlyLimit) {
    return {
      allowed: false,
      reason: `월간 호출 한도(${settings.monthlyLimit}회)를 초과했습니다.`,
      snapshot,
    };
  }

  const dailyRatio = settings.dailyLimit > 0 ? dailyUsed / settings.dailyLimit : 0;
  const monthlyRatio = settings.monthlyLimit > 0 ? monthlyUsed / settings.monthlyLimit : 0;
  const maxRatio = Math.max(dailyRatio, monthlyRatio);

  return {
    allowed: true,
    warning:
      maxRatio >= settings.warningThreshold
        ? '사용량이 임계치에 근접했습니다. 설정에서 한도를 확인하세요.'
        : undefined,
    snapshot,
  };
}
