export const ONBOARDING_STEPS = [
  'first_decompose',
  'first_save',
  'first_assemble',
  'visit_library',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingState {
  dismissed: boolean;
  completedSteps: OnboardingStep[];
}

const STORAGE_KEY = 'promptblocks_onboarding_state';

function getInitialState(): OnboardingState {
  return {
    dismissed: false,
    completedSteps: [],
  };
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return getInitialState();
    return JSON.parse(data) as OnboardingState;
  } catch {
    return getInitialState();
  }
}

export function completeOnboardingStep(step: OnboardingStep): OnboardingState {
  const state = getOnboardingState();
  if (state.completedSteps.includes(step)) return state;

  const next: OnboardingState = {
    ...state,
    completedSteps: [...state.completedSteps, step],
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function dismissOnboarding(): OnboardingState {
  const state = getOnboardingState();
  const next: OnboardingState = {
    ...state,
    dismissed: true,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function resetOnboarding(): OnboardingState {
  const next = getInitialState();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}
