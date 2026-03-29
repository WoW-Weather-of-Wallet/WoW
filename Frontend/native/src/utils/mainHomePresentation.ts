import type { LegendListItem, SpendingStyleMetric } from '../constants/main/types';
import { COLORS } from '../constants/theme';
import type { HomeSpendingTypeReason } from '../hooks/useHomeSpendingTypeSummary';
import type { AiAnalysisReport } from '../services/ai';
import type {
  SpendingHalfYearlyResponse,
  SpendingMonthlyCompareResponse,
} from '../services/main';

const CATEGORY_COLORS = [
  COLORS.chartRed,
  COLORS.chartBlue,
  COLORS.chartYellow,
  COLORS.chartGreen,
  COLORS.primaryLight,
  COLORS.dotMint,
] as const;

export const resolveSpendingIconName = (iconCode?: string | null) => {
  switch (iconCode) {
    case 'pulse-outline':
    case 'car-outline':
    case 'restaurant-outline':
    case 'book-outline':
    case 'cafe-outline':
    case 'shirt-outline':
    case 'sparkles-outline':
    case 'stats-chart-outline':
    case 'wallet-outline':
      return iconCode;
    case 'scale-balance':
      return 'stats-chart-outline';
    default:
      return 'sparkles-outline';
  }
};

export const formatMonthLabel = (year?: number, month?: number) =>
  year && month ? `${year}년 ${month}월` : '-';

export const buildSpendingMetrics = (
  response: SpendingHalfYearlyResponse | null,
): SpendingStyleMetric[] =>
  response?.categoryResults.slice(0, 6).map((item, index) => ({
    id: `${item.name}-${index}`,
    label: item.name,
    value: `${item.percentage}%`,
    score: item.percentage,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })) ?? [];

export const buildSpendingReasons = (
  response: SpendingHalfYearlyResponse | null,
): HomeSpendingTypeReason[] => {
  if (!response || response.categoryResults.length === 0) {
    return [];
  }

  const topCategories = response.categoryResults.slice(0, 2);
  const tones = ['red', 'purple'] as const;

  return [
    ...topCategories.map((item, index) => ({
      title: `${item.name} 비중이 높아요`,
      description: `${item.name}가 전체 소비의 ${item.percentage}%를 차지하고 있어 현재 소비 성향을 가장 강하게 보여주는 카테고리예요.`,
      tone: tones[index],
    })),
    {
      title: '최근 소비 패턴 요약',
      description: response.description || response.spendingType.summary,
      tone: 'green',
    },
  ];
};

export const buildAiSpendingMetrics = (
  report: AiAnalysisReport | null,
): SpendingStyleMetric[] =>
  report?.categories.slice(0, 6).map((item, index) => ({
    id: `${item.name}-${index}`,
    label: item.name,
    value: `${item.myRatio}%`,
    score: Math.max(item.myRatio, item.baseRatio, 0),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })) ?? [];

export const buildAiSpendingReasons = (
  report: AiAnalysisReport | null,
): HomeSpendingTypeReason[] => {
  if (!report) {
    return [];
  }

  const tones = ['red', 'purple'] as const;
  const overspendingReasons = report.overspending
    .filter((item) => item.name.trim().length > 0)
    .slice(0, 2)
    .map((item, index) => ({
      title: `${item.name} 비중이 높아요`,
      description: `평균 ${item.baseRatio}%보다 내 비중이 ${item.myRatio}%로 높아요. 최대 ${item.savableAmount.toLocaleString()}원까지 줄여볼 수 있어요.`,
      tone: tones[index],
    }));

  const firstTip = report.tips.find(
    (tip) => tip.title.trim().length > 0 || tip.description.trim().length > 0,
  );
  const actionDescription =
    report.goal.actionTip ||
    firstTip?.description ||
    report.cluster.description;

  if (!actionDescription) {
    return overspendingReasons;
  }

  return [
    ...overspendingReasons,
    {
      title: firstTip?.title || '이번 달 실천 포인트',
      description: actionDescription,
      tone: 'green',
    },
  ];
};

export const buildMonthlyComparisonLegend = (
  response: SpendingMonthlyCompareResponse | null,
): LegendListItem[] => {
  if (!response) {
    return [];
  }

  const currentMap = new Map(
    response.currentMonth.categories.map((item) => [item.categoryName, item.percentage]),
  );
  const lastMap = new Map(
    response.lastMonth.categories.map((item) => [item.categoryName, item.percentage]),
  );

  const names = Array.from(
    new Set([
      ...response.currentMonth.categories.map((item) => item.categoryName),
      ...response.lastMonth.categories.map((item) => item.categoryName),
    ]),
  ).slice(0, 6);

  return names.map((name, index) => ({
    id: `${name}-${index}`,
    label: name,
    value: `이번 ${currentMap.get(name) ?? 0}% / 지난달 ${lastMap.get(name) ?? 0}%`,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
};

export const buildMonthlyInsight = (response: SpendingMonthlyCompareResponse | null) => {
  if (!response) {
    return null;
  }

  const currentTotal = response.currentMonth.totalAmount;
  const lastTotal = response.lastMonth.totalAmount;
  const diff = currentTotal - lastTotal;
  const topCategory = response.currentMonth.categories[0]?.categoryName;

  if (currentTotal === 0 && lastTotal === 0) {
    return '이번 달과 지난달 모두 아직 집계된 소비가 없어요.';
  }

  if (diff > 0) {
    return `이번 달 소비가 지난달보다 ${diff.toLocaleString()}원 많아요.${topCategory ? ` 특히 ${topCategory} 비중을 먼저 확인해 보세요.` : ''}`;
  }

  if (diff < 0) {
    return `이번 달 소비가 지난달보다 ${Math.abs(diff).toLocaleString()}원 줄었어요.${topCategory ? ` 현재 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
  }

  return `이번 달 소비는 지난달과 비슷한 수준이에요.${topCategory ? ` 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
};
