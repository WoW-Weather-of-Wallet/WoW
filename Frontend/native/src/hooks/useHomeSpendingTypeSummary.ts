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
    title: '분석 결과 대기 중',
    description: '거래 데이터가 쌓이면 카테고리별 소비 성향과 주요 패턴을 이곳에서 확인할 수 있어요.',
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
    const displayTitle = title || '분석 전';
    const displayDescription =
      description || '아직 소비 유형 분석 결과가 없어요. 거래 데이터를 더 쌓아보세요.';
    const displayIntroDescription =
      description || '아직 6개월 소비 분석 결과가 없어요. 거래 데이터를 조금 더 쌓아보세요.';
    const displayMetrics = metrics ?? [];
    const hasMetrics = displayMetrics.length > 0;
    const displayReasons =
      reasons && reasons.length > 0 ? reasons : emptyReasons;

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
