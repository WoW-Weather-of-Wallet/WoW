import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import type { LegendListItem, SpendingStyleMetric } from '../../constants/main/types';
import type { HomeSpendingTypeReason } from '../../hooks/useHomeSpendingTypeSummary';

export type ReasonHighlightTone = HomeSpendingTypeReason['tone'];

export interface ReasonHighlightCardProps {
  title: string;
  description: string;
  tone: ReasonHighlightTone;
}

export interface SheetIconHeaderProps {
  iconName: ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  title: string;
  onPressInfo?: () => void;
}

export interface HomeDashboardWeatherCardData {
  weatherName?: string | null;
  weatherDescription?: string | null;
  weatherIconCode?: string | null;
  isWeatherLoading: boolean;
}

export interface HomeDashboardSpendingTypeCardData {
  spendingTypeTitle?: string | null;
  spendingTypeDescription?: string | null;
  spendingTypeIconName?: ComponentProps<typeof Ionicons>['name'];
}

export interface HomeDashboardBudgetReportCardData {
  monthLabel: string;
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
}

export interface HomeDashboardSpendingTypeSheetData {
  spendingTypeTitle?: string | null;
  spendingTypeIconName?: ComponentProps<typeof Ionicons>['name'];
  spendingTypeDescription?: string | null;
  spendingMetrics: SpendingStyleMetric[];
  spendingReasons: HomeSpendingTypeReason[];
}

export interface HomeDashboardMonthlyReportSheetData {
  currentMonthLabel: string;
  currentMonthTotalAmount?: number | null;
  lastMonthLabel: string;
  lastMonthTotalAmount?: number | null;
  comparisonLegend: LegendListItem[];
  monthlyInsight?: string | null;
  canCreateBudget: boolean;
  isBudgetSubmitting: boolean;
  onCreateBudget: (amount: number) => Promise<void> | void;
}
