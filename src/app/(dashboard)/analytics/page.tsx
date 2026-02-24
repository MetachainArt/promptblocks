'use client';

import { BarChart3, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { getProductAnalyticsSummary, type ProductAnalyticsSummary } from '@/lib/analytics';
import { getUsageSnapshot } from '@/lib/usageLimits';

function MetricCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{hint}</p>
          </div>
          <div className={`rounded-xl p-2 ${accent}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const summary: ProductAnalyticsSummary = getProductAnalyticsSummary();

  const usage = getUsageSnapshot();
  const dailyUsageRatio =
    usage.settings.dailyLimit > 0 ? (usage.dailyUsed / usage.settings.dailyLimit) * 100 : 0;
  const monthlyUsageRatio =
    usage.settings.monthlyLimit > 0 ? (usage.monthlyUsed / usage.settings.monthlyLimit) * 100 : 0;
  const funnelStepValues = [
    summary.funnel.signedInOrVisited,
    summary.funnel.firstDecompose,
    summary.funnel.firstSave,
    summary.funnel.firstAssemble,
  ];
  const funnelBase = Math.max(funnelStepValues[0], 1);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-6">
        <h1 className="text-3xl font-black text-gray-900">제품 분석 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">가입 이후 핵심 퍼널과 사용량을 확인합니다.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-purple-100 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500">핵심 KPI: 분해 성공</p>
            <p className="mt-1 text-3xl font-black text-gray-900">
              {summary.decomposeSuccessCount}회
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500">핵심 KPI: 주간 활성</p>
            <p className="mt-1 text-3xl font-black text-gray-900">{summary.weeklyActiveDays}일</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="주간 활성 일수"
          value={`${summary.weeklyActiveDays}일`}
          hint="최근 7일 기준"
          icon={<Activity className="h-5 w-5" />}
          accent="bg-purple-50 text-purple-600"
        />
        <MetricCard
          label="분해 성공"
          value={`${summary.decomposeSuccessCount}회`}
          hint="decompose 성공 이벤트"
          icon={<BarChart3 className="h-5 w-5" />}
          accent="bg-cyan-50 text-cyan-600"
        />
        <MetricCard
          label="분해 에러율"
          value={`${(summary.decomposeErrorRate * 100).toFixed(1)}%`}
          hint="실패/전체 분해 시도"
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="bg-rose-50 text-rose-600"
        />
        <MetricCard
          label="공유 링크 생성"
          value={`${summary.shareCount}회`}
          hint="read-only 링크"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900">퍼널</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">로그인/진입</p>
              <p className="text-xl font-bold text-gray-900">{summary.funnel.signedInOrVisited}</p>
              <p className="mt-1 text-[11px] text-gray-500">100%</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">첫 분해</p>
              <p className="text-xl font-bold text-gray-900">{summary.funnel.firstDecompose}</p>
              <p className="mt-1 text-[11px] text-gray-500">
                {Math.round((summary.funnel.firstDecompose / funnelBase) * 100)}%
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">첫 저장</p>
              <p className="text-xl font-bold text-gray-900">{summary.funnel.firstSave}</p>
              <p className="mt-1 text-[11px] text-gray-500">
                {Math.round((summary.funnel.firstSave / funnelBase) * 100)}%
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">첫 조립 복사</p>
              <p className="text-xl font-bold text-gray-900">{summary.funnel.firstAssemble}</p>
              <p className="mt-1 text-[11px] text-gray-500">
                {Math.round((summary.funnel.firstAssemble / funnelBase) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900">사용량 가드레일</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500">일일 사용량</p>
              <p className="text-lg font-bold text-gray-900">
                {usage.dailyUsed} / {usage.settings.dailyLimit}
              </p>
              <div className="mt-2">
                <ProgressBar value={dailyUsageRatio} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500">월간 사용량</p>
              <p className="text-lg font-bold text-gray-900">
                {usage.monthlyUsed} / {usage.settings.monthlyLimit}
              </p>
              <div className="mt-2">
                <ProgressBar value={monthlyUsageRatio} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
