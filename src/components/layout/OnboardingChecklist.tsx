'use client';

import { useMemo } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import {
  ONBOARDING_STEPS,
  type OnboardingState,
  type OnboardingStep,
  dismissOnboarding,
} from '@/lib/onboarding';

interface OnboardingChecklistProps {
  state: OnboardingState;
  onChange: (next: OnboardingState) => void;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  first_decompose: '첫 분해 실행',
  first_save: '블록 1회 저장',
  first_assemble: '조립 프롬프트 1회 복사',
  visit_library: '라이브러리 방문',
};

export function OnboardingChecklist({ state, onChange }: OnboardingChecklistProps) {
  const completed = state.completedSteps.length;
  const total = ONBOARDING_STEPS.length;
  const progress = Math.round((completed / total) * 100);

  const pendingSteps = useMemo(() => {
    return ONBOARDING_STEPS.filter((step) => !state.completedSteps.includes(step));
  }, [state.completedSteps]);

  if (state.dismissed || completed === total) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-purple-800">온보딩 체크리스트</h3>
          <p className="text-xs text-purple-700">핵심 워크플로우를 빠르게 완료해보세요.</p>
        </div>
        <button
          onClick={() => onChange(dismissOnboarding())}
          className="rounded-lg p-1 text-purple-600 hover:bg-purple-100"
          title="체크리스트 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-purple-100">
        <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {ONBOARDING_STEPS.map((step) => {
          const done = state.completedSteps.includes(step);
          return (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                done
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-purple-200 bg-white text-purple-800'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${done ? 'text-green-600' : 'text-purple-300'}`} />
              <span>{STEP_LABELS[step]}</span>
            </div>
          );
        })}
      </div>

      {pendingSteps.length > 0 && (
        <p className="mt-3 text-xs text-purple-700">
          다음 추천: <strong>{STEP_LABELS[pendingSteps[0]]}</strong>
        </p>
      )}
    </div>
  );
}
