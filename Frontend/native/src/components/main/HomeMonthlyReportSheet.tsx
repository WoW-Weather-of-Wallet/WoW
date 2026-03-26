import React from 'react';

import type { LegendListItem } from '../../constants/main/types';
import { useHomeMonthlyBudgetForm } from '../../hooks/useHomeMonthlyBudgetForm';
import BottomSheetModal from '../common/BottomSheetModal';
import HomeBudgetSetupCard from './HomeBudgetSetupCard';
import HomeMonthlyComparisonSection from './HomeMonthlyComparisonSection';
import HomeMonthlyInsightCard from './HomeMonthlyInsightCard';

interface HomeMonthlyReportSheetProps {
  visible: boolean;
  onClose: () => void;
  subtitle?: string;
  currentMonthLabel?: string;
  currentTotalAmount?: number | null;
  lastMonthLabel?: string;
  lastTotalAmount?: number | null;
  comparisonLegend?: LegendListItem[];
  insightText?: string | null;
  canCreateBudget?: boolean;
  isCreatingBudget?: boolean;
  onCreateBudget?: (amount: number) => Promise<void> | void;
}

export default function HomeMonthlyReportSheet({
  visible,
  onClose,
  subtitle,
  currentMonthLabel,
  currentTotalAmount,
  lastMonthLabel,
  lastTotalAmount,
  comparisonLegend = [],
  insightText,
  canCreateBudget = false,
  isCreatingBudget = false,
  onCreateBudget,
}: HomeMonthlyReportSheetProps) {
  const {
    budgetAmount,
    isBudgetAmountValid,
    handleBudgetAmountChange,
    handleCreateBudget,
  } = useHomeMonthlyBudgetForm({
    visible,
    isCreatingBudget,
    onCreateBudget,
  });

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="이번 달 vs 지난달 비교"
      subtitle={subtitle || '소비 흐름과 예산 상태를 한눈에 확인해 보세요.'}
    >
      {canCreateBudget ? (
        <HomeBudgetSetupCard
          title="이번 달 예산을 먼저 등록해 보세요"
          description="아직 예산을 설정하지 않았다면 여기서 바로 등록하고 이번 달 소비 현황을 함께 확인할 수 있어요."
          inputLabel="예산 금액 입력"
          buttonTitle={isCreatingBudget ? '예산 등록 중...' : '이번 달 예산 등록'}
          budgetAmount={budgetAmount}
          isDisabled={!isBudgetAmountValid || isCreatingBudget}
          onBudgetAmountChange={handleBudgetAmountChange}
          onSubmit={() => {
            void handleCreateBudget();
          }}
        />
      ) : null}

      <HomeMonthlyComparisonSection
        currentMonthLabel={currentMonthLabel}
        currentTotalAmount={currentTotalAmount}
        lastMonthLabel={lastMonthLabel}
        lastTotalAmount={lastTotalAmount}
        amountLabel="총 소비"
        comparisonLegend={comparisonLegend}
        emptyLegendLabel="분석 데이터 없음"
      />

      <HomeMonthlyInsightCard
        text={insightText || '이번 달과 지난달 소비 비교 데이터가 아직 충분하지 않아요.'}
      />
    </BottomSheetModal>
  );
}
