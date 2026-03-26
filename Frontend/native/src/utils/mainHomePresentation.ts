import type { LegendListItem, SpendingStyleMetric } from '../constants/main/types';
import type { CalendarDayItem } from '../mock/calendar';
import type { HomeSpendingCategory } from '../mock/dashboard';
import { COLORS } from '../constants/theme';
import type {
  SpendingHalfYearlyResponse,
  SpendingMonthlyCompareResponse,
} from '../services/main';

const CATEGORY_COLORS = ['#E97975', '#7D8DF1', '#F3B84D', '#86D5D0', '#9D92F4', '#7DD3A7'];
export const HOME_WEEKLY_PREVIEW_WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

export const buildSpendingReasons = (response: SpendingHalfYearlyResponse | null) => {
  if (!response || response.categoryResults.length === 0) {
    return [];
  }

  const topCategories = response.categoryResults.slice(0, 2);
  const tones = ['red', 'purple'] as const;

  return [
    ...topCategories.map((item, index) => ({
      title: `${item.name} 비중이 높아요`,
      description: `${item.name}이 전체 소비의 ${item.percentage}%를 차지하고 있어 현재 소비 성향을 가장 강하게 보여주는 카테고리예요.`,
      tone: tones[index],
    })),
    {
      title: '최근 소비 패턴 요약',
      description: response.description || response.spendingType.summary,
      tone: 'green' as const,
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
    value: `이번 ${currentMap.get(name) ?? 0}% · 지난 ${lastMap.get(name) ?? 0}%`,
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
    return `이번 달 소비가 지난달보다 ${diff.toLocaleString()}원 많아요.${topCategory ? ` 특히 ${topCategory} 비중을 먼저 확인해보세요.` : ''}`;
  }

  if (diff < 0) {
    return `이번 달 소비가 지난달보다 ${Math.abs(diff).toLocaleString()}원 줄었어요.${topCategory ? ` 현재 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
  }

  return `이번 달 소비는 지난달과 비슷한 수준이에요.${topCategory ? ` 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
};

export const buildWeeklyPreviewItems = (items: CalendarDayItem[]): CalendarDayItem[] =>
  items.length > 0
    ? items
    : Array.from({ length: 7 }, (_, index) => ({
        dateKey: `empty-week-${index}`,
        dayNumber: index + 1,
        amount: undefined,
        tone: 'mint' as const,
        weatherTone: undefined,
        isCurrentMonth: true,
        isToday: false,
        isFuture: false,
      }));

export const buildHomeCategoryDisplayItems = (
  items: HomeSpendingCategory[],
): HomeSpendingCategory[] =>
  items.length > 0
    ? items
    : [
        {
          id: 'empty-category',
          label: '-',
          amount: 0,
          ratio: 0,
          icon: 'remove-outline',
          color: COLORS.gray300,
        },
      ];
