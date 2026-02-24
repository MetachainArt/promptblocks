'use client';

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { PromptQualityResult } from '@/lib/promptQuality';

interface QualityScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function QualityScoreBadge({
  score,
  showLabel = true,
  size = 'md',
}: QualityScoreBadgeProps) {
  const getColor = () => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getIcon = () => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${getColor()} ${sizeClasses[size]}`}
    >
      {getIcon()}
      <span>{score}점</span>
      {showLabel && (
        <span className="text-xs opacity-75">
          {score >= 80 ? '좋음' : score >= 60 ? '보통' : '개선 필요'}
        </span>
      )}
    </div>
  );
}

interface QualityIssuesListProps {
  issues: PromptQualityResult['issues'];
}

export function QualityIssuesList({ issues }: QualityIssuesListProps) {
  if (issues.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {issues.map((issue, index) => (
        <div
          key={index}
          className={`flex items-start gap-2 text-sm ${
            issue.level === 'error' ? 'text-red-600' : 'text-amber-600'
          }`}
        >
          {issue.level === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
}

interface BlockQualityIndicatorProps {
  content: string;
}

export function BlockQualityIndicator({ content }: BlockQualityIndicatorProps) {
  const issues: string[] = [];

  if (content.length < 4) {
    issues.push('너무 짧음');
  }
  if (content.length > 200) {
    issues.push('너무 김');
  }

  const bannedWords = ['nsfw', 'hate', 'violence'];
  if (bannedWords.some((word) => content.toLowerCase().includes(word))) {
    issues.push('금지어 포함');
  }

  if (issues.length === 0) return null;

  return (
    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
      <AlertTriangle className="h-3 w-3" />
      <span>{issues.join(', ')}</span>
    </div>
  );
}
