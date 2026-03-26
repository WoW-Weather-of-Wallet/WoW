import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import type { AiResultData } from '../store/aiStore';

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

const formatCurrency = (amount: number) => `${Math.max(0, Math.round(amount)).toLocaleString()}원`;

const formatRatio = (ratio: number) => `${ratio.toFixed(1)}%`;

export function useAiResultSummary(resultData: AiResultData | null, errorMessage?: string | null) {
  const userName = useAuthStore((state) => state.user?.name);

  return useMemo(() => {
    const trimmedUserName = userName?.trim();
    const displayName = trimmedUserName ? `${trimmedUserName}님의` : '이번 달';
    const report = resultData?.report;
    const completedAtLabel = formatCompletedAt(resultData?.completedAt);
    const fromPush = Boolean(resultData?.fromPush);

    if (!report) {
      const cards: AiResultSummaryCardData[] = [
        {
          id: 'status',
          title: '분석 상태',
          headline: errorMessage ? '최신 결과를 불러오지 못했어요' : '최신 결과를 준비 중이에요',
          description:
            errorMessage
              ? errorMessage
              : 'AI 리포트 상세 데이터는 아직 동기화되지 않았어요. 잠시 후 다시 열면 최신 분석 결과가 반영됩니다.',
        },
        {
          id: 'completed-at',
          title: '최근 완료 시각',
          headline: completedAtLabel,
          description: fromPush
            ? '알림을 통해 도착한 결과예요. 백엔드의 최신 리포트를 다시 확인하고 있어요.'
            : '가장 최근에 저장된 분석 완료 시각입니다.',
        },
      ];

      return {
        displayName,
        title: 'AI 소비 피드백',
        buttonTitle: '다시 분석하기',
        cards,
      };
    }

    const topOverspendingItems = report.overspending.slice(0, 3).map((item) => (
      `${item.name} · ${formatCurrency(item.savableAmount)} 절약 여지 · `
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
      {
        id: 'cluster',
        title: '내 소비 유형',
        headline: [report.cluster.icon, report.cluster.name].filter(Boolean).join(' '),
        description:
          report.cluster.description || '최근 3개월 소비 흐름을 기준으로 소비 유형을 분석했어요.',
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
        title: '가장 먼저 해볼 액션',
        headline: formatCurrency(report.goal.savableAmount),
        description:
          report.goal.actionTip || '절약 가능 금액이 큰 항목부터 우선순위를 정해 조정해보세요.',
      },
      {
        id: 'overspending',
        title: '절약 여지가 큰 항목',
        description: topOverspendingItems.length
          ? '비중이 크게 높은 항목부터 순서대로 정리했어요.'
          : '지금은 눈에 띄는 과소비 항목이 없어요.',
        items: topOverspendingItems,
      },
      {
        id: 'categories',
        title: '주요 소비 카테고리',
        description: '최근 3개월 누적 기준으로 가장 큰 지출 항목입니다.',
        items: topCategoryItems,
      },
      {
        id: 'completed-at',
        title: '리포트 생성 시각',
        headline: completedAtLabel,
        description: fromPush
          ? '알림을 통해 방금 도착한 최신 분석 결과입니다.'
          : '현재 화면에 표시 중인 AI 리포트의 생성 시각입니다.',
      },
      ...tipCards,
    ];

    return {
      displayName,
      title: 'AI 소비 피드백',
      buttonTitle: '다시 분석하기',
      cards,
    };
  }, [errorMessage, resultData, userName]);
}
