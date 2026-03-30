import React, { useMemo } from 'react';

import {
  AiAnalysisPreview,
  AiGoalPreview,
  AiNotificationPreview,
} from '../components/ai';

export interface AiFeatureCardData {
  id: number;
  title: string;
  description: string;
  preview: React.ReactNode;
}

export function useAiFeatureCards() {
  return useMemo<AiFeatureCardData[]>(
    () => [
      {
        id: 1,
        title: '소비 분석',
        description:
          '이번 달 소비 패턴을 바탕으로 어떤 항목에 지출이 몰려 있는지 한눈에 확인할 수 있어요.',
        preview: <AiAnalysisPreview />,
      },
      {
        id: 2,
        title: '예산 목표 추천',
        description:
          '현재 소비 흐름을 기준으로 무리 없는 예산 목표를 제안하고 절약 방향까지 함께 보여드려요.',
        preview: <AiGoalPreview />,
      },
      {
        id: 3,
        title: '분석 완료 알림',
        description:
          '분석이 끝나면 알림으로 바로 안내해드려서 결과 화면까지 빠르게 이어서 확인할 수 있어요.',
        preview: <AiNotificationPreview />,
      },
    ],
    [],
  );
}
