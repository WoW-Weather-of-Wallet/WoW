import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import CustomTextInput from '../common/CustomTextInput';
import GradientButton from '../common/GradientButton';
import { COLORS, wp } from '../../constants/theme';
import LegendList from './LegendList';
import { styles } from './HomeMonthlyReportSheet.styles';
import type { LegendListItem } from '../../constants/main/types';

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
  const [budgetAmount, setBudgetAmount] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setBudgetAmount('');
    }
  }, [visible]);

  const parsedBudgetAmount = Number(budgetAmount.replace(/[^0-9]/g, ''));
  const isBudgetAmountValid = Number.isFinite(parsedBudgetAmount) && parsedBudgetAmount > 0;

  const handleCreateBudget = async () => {
    if (!onCreateBudget || !isBudgetAmountValid || isCreatingBudget) {
      return;
    }

    await onCreateBudget(parsedBudgetAmount);
    setBudgetAmount('');
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="이번 달 vs 지난달 비교"
      subtitle={subtitle || '소비 흐름과 예산 상태를 함께 확인해보세요.'}
    >
      {canCreateBudget ? (
        <View style={styles.budgetFormCard}>
          <Text style={styles.budgetFormTitle}>이번 달 예산을 먼저 등록해보세요</Text>
          <Text style={styles.budgetFormDescription}>
            현재 백엔드 스펙상 예산 생성만 연결되어 있어요. 등록 후 이번 세션에서 남은 예산과 사용률을 바로 확인할 수 있습니다.
          </Text>
          <CustomTextInput
            label="예산 금액 입력"
            value={budgetAmount}
            onChangeText={(text) => setBudgetAmount(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <GradientButton
            title={isCreatingBudget ? '예산 등록 중...' : '이번 달 예산 등록'}
            onPress={() => {
              void handleCreateBudget();
            }}
            disabled={!isBudgetAmountValid || isCreatingBudget}
            style={(!isBudgetAmountValid || isCreatingBudget) ? styles.disabledBudgetButton : undefined}
          />
        </View>
      ) : null}

      <View style={styles.compareRow}>
        <View style={styles.compareColumn}>
          <View style={styles.compareChipPrimary}>
            <Text style={styles.compareChipPrimaryText}>{currentMonthLabel || '-'}</Text>
          </View>
          <View style={styles.reportRing}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>
                {currentTotalAmount == null ? '-' : `${currentTotalAmount.toLocaleString()}원`}
              </Text>
              <Text style={styles.reportRingLabel}>총 소비</Text>
            </View>
          </View>
        </View>

        <View style={styles.compareColumn}>
          <View style={styles.compareChipMuted}>
            <Text style={styles.compareChipMutedText}>{lastMonthLabel || '-'}</Text>
          </View>
          <View style={[styles.reportRing, styles.reportRingMuted]}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>
                {lastTotalAmount == null ? '-' : `${lastTotalAmount.toLocaleString()}원`}
              </Text>
              <Text style={styles.reportRingLabel}>총 소비</Text>
            </View>
          </View>
        </View>
      </View>

      <LegendList
        items={
          comparisonLegend.length > 0
            ? comparisonLegend
            : [{ id: 'empty', label: '분석 데이터 없음', value: '-', color: COLORS.textTertiary }]
        }
        variant="divider"
      />

      <View style={styles.insightCard}>
        <Ionicons name="bar-chart-outline" size={wp(22)} color={COLORS.primary} />
        <Text style={styles.insightText}>
          {insightText || '이번 달과 지난달 소비 비교 데이터가 아직 충분하지 않아요.'}
        </Text>
      </View>
    </BottomSheetModal>
  );
}
