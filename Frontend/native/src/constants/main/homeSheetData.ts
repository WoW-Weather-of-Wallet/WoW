import type {
  LegendListItem,
  SpendingStyleMetric,
} from './types';

// 메인 홈 바텀시트에서 공통으로 쓰는 정적 데이터를 한 곳에 모아둡니다.
export const spendingTypeLegend: SpendingStyleMetric[] = [
  { id: 'dining-out', label: '외식', value: '85%', score: 85, color: '#E97975' },
  { id: 'transport', label: '교통서비스', value: '45%', score: 45, color: '#7D8DF1' },
  { id: 'shopping', label: '인터넷쇼핑', value: '60%', score: 60, color: '#F3B84D' },
  { id: 'culture', label: '공연관람', value: '70%', score: 70, color: '#86D5D0' },
  { id: 'telecom', label: '시스템/통신', value: '55%', score: 55, color: '#9D92F4' },
  { id: 'medical', label: '병원/의료', value: '30%', score: 30, color: '#E78AB6' },
  { id: 'cafe', label: '커피/음료', value: '40%', score: 40, color: '#7DD3A7' },
  { id: 'retail', label: '음/식료품소매', value: '25%', score: 25, color: '#E2BE63' },
];

export const monthlyComparisonLegend: LegendListItem[] = [
  { id: 'dining-out', label: '외식', value: '35% ↑', color: '#E97975' },
  { id: 'shopping', label: '인터넷쇼핑', value: '14% →', color: '#F3B84D' },
  { id: 'telecom', label: '시스템/통신', value: '9% →', color: '#9D92F4' },
  { id: 'transport', label: '교통서비스', value: '16% ↓', color: '#7D8DF1' },
  { id: 'culture', label: '공연관람', value: '12% ↑', color: '#86D5D0' },
  { id: 'cafe', label: '커피/음료', value: '14% ↓', color: '#D5D6E3' },
];
