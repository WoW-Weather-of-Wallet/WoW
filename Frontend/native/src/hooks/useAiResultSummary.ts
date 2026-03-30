import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import type { AiErrorState, AiResultData } from '../store/aiStore';

type AiResultIconName = ComponentProps<typeof Ionicons>['name'];

export interface AiResultSummaryCardData {
  id: string;
  title: string;
  description: string;
  headline?: string;
  iconName?: AiResultIconName;
  iconText?: string;
  items?: string[];
}

interface UseAiResultSummaryOptions {
  errorInfo?: AiErrorState | null;
  isRefreshing?: boolean;
  isStale?: boolean;
}

const formatCompletedAt = (completedAt?: string) => {
  if (!completedAt) {
    return '-';
  }

  const parsedDate = new Date(completedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return completedAt;
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const date = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${date} ${hours}:${minutes}`;
};

const formatCurrency = (amount: number) =>
  `${Math.max(0, Math.round(amount)).toLocaleString()}원`;

const formatRatio = (ratio: number) => `${ratio.toFixed(1)}%`;

const buildStatusCard = (
  reportExists: boolean,
  errorInfo?: AiErrorState | null,
  isRefreshing?: boolean,
  isStale?: boolean,
): AiResultSummaryCardData | null => {
  if (isRefreshing && reportExists) {
    return {
      id: 'result-status',
      title: '리포트 상태',
      headline: '저장된 결과를 먼저 보여주고 있어요',
      description: '최신 AI 리포트를 다시 확인하는 중이에요. 새 결과가 있으면 화면에 바로 반영됩니다.',
    };
  }

  if (errorInfo && reportExists) {
    return {
      id: 'result-status',
      title: '리포트 상태',
      headline: errorInfo.canRetry
        ? '저장된 결과 기준으로 보여드리고 있어요'
        : '지금은 저장된 결과만 확인할 수 있어요',
      description: errorInfo.canRetry
        ? `${errorInfo.message} 기존에 받아둔 결과는 그대로 유지하고 있어요.`
        : errorInfo.message,
    };
  }

  if (isStale && reportExists) {
    return {
      id: 'result-status',
      title: '리포트 상태',
      headline: '저장된 결과를 다시 확인할 수 있어요',
      description: '이달 리포트는 월 단위로 고정되지만, 다른 기기에서 먼저 생성했을 수 있어 최신 상태를 다시 확인할 수 있어요.',
    };
  }

  if (!reportExists && errorInfo) {
    const headline = errorInfo.kind === 'no-transactions'
      ? '이번 달은 아직 분석할 거래가 부족해요'
      : errorInfo.kind === 'report-not-generated'
        ? 'AI 리포트를 준비하고 있어요'
        : '최신 결과를 불러오지 못했어요';

    return {
      id: 'result-status',
      title: '분석 상태',
      headline,
      description: errorInfo.message,
    };
  }

  if (!reportExists) {
    return {
      id: 'result-status',
      title: '분석 상태',
      headline: '이번 달 AI 리포트를 준비하고 있어요',
      description: 'AI 홈에서 분석을 시작하면 결과가 이 화면에 보기 좋게 정리돼요.',
    };
  }

  return null;
};

export function useAiResultSummary(
  resultData: AiResultData | null,
  options: UseAiResultSummaryOptions = {},
) {
  const userName = useAuthStore((state) => state.user?.name);

  return useMemo(() => {
    const trimmedUserName = userName?.trim();
    const displayName = trimmedUserName ? `${trimmedUserName}님의` : '이번 달';
    const report = resultData?.report;
    const completedAtLabel = formatCompletedAt(resultData?.completedAt);
    const fromPush = Boolean(resultData?.fromPush);

    const statusCard = buildStatusCard(
      Boolean(report),
      options.errorInfo,
      options.isRefreshing,
      options.isStale,
    );

    if (!report) {
      return {
        displayName,
        title: 'AI 소비 피드백',
        buttonTitle: 'AI 홈으로 돌아가기',
        cards: statusCard ? [statusCard] : [],
      };
    }

    const topOverspendingItems = report.overspending.slice(0, 3).map((item) => (
      `${item.name} · ${formatCurrency(item.savableAmount)} 절약 가능 · `
      + `${formatRatio(item.myRatio)} -> ${formatRatio(item.baseRatio)}`
    ));

    const topCategoryItems = report.categories.slice(0, 3).map((item) => (
      `${item.name} · ${formatCurrency(item.amount)} · 비중 ${formatRatio(item.myRatio)}`
    ));

    const tipCards: AiResultSummaryCardData[] = report.tips.slice(0, 3).map((tip) => ({
      id: `tip-${tip.order}`,
      title: `AI 팁 ${tip.order}`,
      headline: tip.title || tip.keyword,
      iconName: 'bulb-outline',
      iconText: tip.keyword || undefined,
      description: tip.description || '이번 달 소비 패턴에 맞춘 조정 포인트를 확인해보세요.',
    }));

    const cards: AiResultSummaryCardData[] = [
      ...(statusCard ? [statusCard] : []),
      {
        id: 'cluster',
        title: 'AI 소비 유형',
        headline: [report.cluster.icon, report.cluster.name].filter(Boolean).join(' '),
        description:
          report.cluster.description || '최근 소비 패턴을 기준으로 소비 유형을 분석했어요.',
      },
      {
        id: 'summary',
        title: '이번 분석 요약',
        headline: `${formatCurrency(report.summary.totalSavable)} 절약 가능`,
        description:
          `지금 패턴에서 줄일 수 있는 금액은 ${formatCurrency(report.summary.totalSavable)}이고, `
          + `조정 후 예상 지출은 ${formatCurrency(report.summary.expectedSpending)}입니다.`,
      },
      {
        id: 'goal',
        title: '먼저 조정해볼 항목',
        headline: formatCurrency(report.goal.savableAmount),
        description:
          report.goal.actionTip || '절약 가능 금액이 큰 항목부터 우선순위를 정해 조정해보세요.',
      },
      {
        id: 'overspending',
        title: '절약 우선순위 항목',
        description: topOverspendingItems.length
          ? '비중 차이가 큰 항목부터 순서대로 정리했어요.'
          : '이번 분석에서는 과소비로 분류된 항목이 없었어요.',
        items: topOverspendingItems,
      },
      {
        id: 'categories',
        title: '주요 소비 카테고리',
        description: '최근 3개월 집계 기준으로 금액이 큰 지출 항목입니다.',
        items: topCategoryItems,
      },
      ...tipCards,
    ];

    return {
      displayName,
      title: 'AI 소비 피드백',
      buttonTitle: 'AI 홈으로 돌아가기',
      cards,
    };
  }, [options.errorInfo, options.isRefreshing, options.isStale, resultData, userName]);
}
