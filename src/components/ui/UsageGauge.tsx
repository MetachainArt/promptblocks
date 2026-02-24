'use client';

import React, { useEffect, useState } from 'react';
import { getUsageSnapshot, type UsageSnapshot } from '@/lib/usageLimits';
import { Gauge } from 'lucide-react';

interface UsageGaugeProps {
  showDetails?: boolean;
}

export function UsageGauge({ showDetails = false }: UsageGaugeProps) {
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setUsage(getUsageSnapshot());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setUsage(getUsageSnapshot());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!usage) return null;

  const dailyRatio =
    usage.settings.dailyLimit > 0 ? (usage.dailyUsed / usage.settings.dailyLimit) * 100 : 0;
  const monthlyRatio =
    usage.settings.monthlyLimit > 0 ? (usage.monthlyUsed / usage.settings.monthlyLimit) * 100 : 0;

  const maxRatio = Math.max(dailyRatio, monthlyRatio);

  // Determine color based on usage
  const getColor = (ratio: number) => {
    if (ratio >= 90) return 'text-rose-500';
    if (ratio >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getBgColor = (ratio: number) => {
    if (ratio >= 90) return 'bg-rose-500';
    if (ratio >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (showDetails || isExpanded) {
    return (
      <div
        className="rounded-xl border border-[var(--color-border)] bg-white p-3 shadow-sm"
        onMouseLeave={() => !showDetails && setIsExpanded(false)}
      >
        <div className="mb-2 flex items-center gap-2">
          <Gauge className={`h-4 w-4 ${getColor(maxRatio)}`} />
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">사용량</span>
        </div>

        {/* Daily Usage */}
        <div className="mb-2">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">일일</span>
            <span className="font-medium text-[var(--color-text-primary)]">
              {usage.dailyUsed} / {usage.settings.dailyLimit}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${getBgColor(dailyRatio)} transition-all duration-300`}
              style={{ width: `${Math.min(dailyRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">월간</span>
            <span className="font-medium text-[var(--color-text-primary)]">
              {usage.monthlyUsed} / {usage.settings.monthlyLimit}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${getBgColor(monthlyRatio)} transition-all duration-300`}
              style={{ width: `${Math.min(monthlyRatio, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Compact view
  return (
    <button
      onClick={() => setIsExpanded(true)}
      onMouseEnter={() => setIsExpanded(true)}
      className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 shadow-sm transition-colors hover:border-[var(--color-primary)]"
      title="사용량 보기"
    >
      <Gauge className={`h-4 w-4 ${getColor(maxRatio)}`} />
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${getBgColor(maxRatio)} transition-all duration-300`}
            style={{ width: `${Math.min(maxRatio, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {Math.round(maxRatio)}%
        </span>
      </div>
    </button>
  );
}
