import { useMemo } from 'react';
import type { ComponentProps } from 'react';
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

export function useAiResultSummary(resultData: AiResultData | null) {
  const userName = useAuthStore((state) => state.user?.name);

  return useMemo(() => {
    const trimmedUserName = userName?.trim();
    const displayName = trimmedUserName ? `${trimmedUserName}님` : '이번 분석';
    const completedAtLabel = formatCompletedAt(resultData?.completedAt);
    const fromPush = Boolean(resultData?.fromPush);

    const cards: AiResultSummaryCardData[] = [
      {
        id: 'status',
        title: '분석 상태',
        headline: '분석 완료',
        description: '소비 데이터를 바탕으로 AI 분석이 정상적으로 완료되었어요.',
      },
      {
        id: 'completed-at',
        title: '최근 완료 시각',
        headline: completedAtLabel,
        description: fromPush
          ? '알림을 통해 방금 분석 결과 화면으로 이동했어요.'
          : '가장 최근 분석이 끝난 시각을 보여줍니다.',
      },
      {
        id: 'result-ready',
        title: '결과 준비',
        iconName: 'analytics-outline',
        iconText: fromPush ? '알림으로 바로 확인 중' : '핵심 요약 확인 가능',
        description: '결과 카드의 요약 내용을 위에서부터 차례대로 확인해보세요.',
      },
      {
        id: 'next-step',
        title: '다음 단계',
        description: '홈으로 돌아가 다시 분석을 시작하거나 다른 화면으로 이동할 수 있어요.',
      },
    ];

    return {
      displayName,
      title: 'AI 분석 결과',
      buttonTitle: '홈으로 돌아가기',
      cards,
    };
  }, [resultData?.completedAt, resultData?.fromPush, userName]);
}
