import type {
  LegendListItem,
  SpendingStyleMetric,
} from './types';

// 메인 홈 바텀시트에서 공통으로 쓰는 정적 데이터를 한 곳에 모아둡니다.
export const spendingTypeLegend: SpendingStyleMetric[] = [
  { id: 'food', label: '식비', value: '85%', score: 85, color: '#E97975' },
  { id: 'transport', label: '교통', value: '45%', score: 45, color: '#7D8DF1' },
  { id: 'shopping', label: '쇼핑', value: '60%', score: 60, color: '#F3B84D' },
  { id: 'culture', label: '문화', value: '70%', score: 70, color: '#86D5D0' },
  { id: 'subscription', label: '구독', value: '55%', score: 55, color: '#9D92F4' },
  { id: 'medical', label: '의료', value: '30%', score: 30, color: '#E78AB6' },
  { id: 'education', label: '교육', value: '40%', score: 40, color: '#7DD3A7' },
  { id: 'other', label: '기타', value: '25%', score: 25, color: '#E2BE63' },
];

export const monthlyComparisonLegend: LegendListItem[] = [
  { id: 'food', label: '식비', value: '35% ↑', color: '#E97975' },
  { id: 'shopping', label: '쇼핑', value: '14% →', color: '#F3B84D' },
  { id: 'subscription', label: '구독', value: '9% →', color: '#9D92F4' },
  { id: 'transport', label: '교통', value: '16% ↓', color: '#7D8DF1' },
  { id: 'culture', label: '문화', value: '12% ↑', color: '#86D5D0' },
  { id: 'other', label: '기타', value: '14% ↓', color: '#D5D6E3' },
];
