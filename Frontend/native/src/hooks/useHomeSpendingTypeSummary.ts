import React from 'react';

import type { SpendingStyleMetric } from '../constants/main/types';

export type HomeSpendingTypeReasonTone = 'red' | 'purple' | 'green';

export interface HomeSpendingTypeReason {
  title: string;
  description: string;
  tone: HomeSpendingTypeReasonTone;
}

interface UseHomeSpendingTypeSummaryParams {
  title?: string | null;
  description?: string | null;
  metrics?: SpendingStyleMetric[];
  reasons?: HomeSpendingTypeReason[];
}

const emptyReasons: HomeSpendingTypeReason[] = [
  {
    title: '분석을 준비하고 있어요',
    description: '거래 내역이 조금 더 쌓이면 카테고리별 소비 성향과 주요 패턴을 보기 쉽게 정리해드릴게요.',
    tone: 'purple',
  },
];

export function useHomeSpendingTypeSummary({
  title,
  description,
  metrics,
  reasons,
}: UseHomeSpendingTypeSummaryParams) {
  return React.useMemo(() => {
    const displayTitle = title || '소비 성향을 분석하고 있어요';
    const displayDescription =
      description || '거래 내역이 더 모이면 소비 유형과 카테고리별 특징을 한눈에 보여드릴게요.';
    const displayIntroDescription =
      description || '최근 거래 흐름이 더 쌓이면 6개월 소비 패턴을 보기 좋게 정리해드릴게요.';
    const displayMetrics = metrics ?? [];
    const hasMetrics = displayMetrics.length > 0;
    const displayReasons = reasons && reasons.length > 0 ? reasons : emptyReasons;

    return {
      displayTitle,
      displayDescription,
      displayIntroDescription,
      displayMetrics,
      hasMetrics,
      displayReasons,
    };
  }, [description, metrics, reasons, title]);
}
