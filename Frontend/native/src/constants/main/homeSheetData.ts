import type {
  LegendListItem,
  SpendingStyleMetric,
} from './types';
import { COLORS } from '../theme';

// 메인 홈 바텀시트에서 공통으로 쓰는 정적 데이터를 한 곳에 모아둡니다.
export const spendingTypeLegend: SpendingStyleMetric[] = [
  { id: 'dining-out', label: '외식', value: '85%', score: 85, color: COLORS.chartRed },
  { id: 'transport', label: '교통서비스', value: '45%', score: 45, color: COLORS.chartBlue },
  { id: 'shopping', label: '인터넷쇼핑', value: '60%', score: 60, color: COLORS.chartYellow },
  { id: 'culture', label: '공연관람', value: '70%', score: 70, color: COLORS.chartGreen },
  { id: 'telecom', label: '시스템/통신', value: '55%', score: 55, color: COLORS.primaryLight },
  { id: 'medical', label: '병원/의료', value: '30%', score: 30, color: COLORS.chartRedMuted },
  { id: 'cafe', label: '커피/음료', value: '40%', score: 40, color: COLORS.dotMint },
  { id: 'retail', label: '음/식료품소매', value: '25%', score: 25, color: COLORS.dotGold },
];

export const monthlyComparisonLegend: LegendListItem[] = [
  { id: 'dining-out', label: '외식', value: '35% ↑', color: COLORS.chartRed },
  { id: 'shopping', label: '인터넷쇼핑', value: '14% →', color: COLORS.chartYellow },
  { id: 'telecom', label: '시스템/통신', value: '9% →', color: COLORS.primaryLight },
  { id: 'transport', label: '교통서비스', value: '16% ↓', color: COLORS.chartBlue },
  { id: 'culture', label: '공연관람', value: '12% ↑', color: COLORS.chartGreen },
  { id: 'cafe', label: '커피/음료', value: '14% ↓', color: COLORS.gray300 },
];
