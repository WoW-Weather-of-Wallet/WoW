export type CalendarWeatherTone = 'cloudy' | 'rainy' | 'sunny' | 'clear';

export interface CalendarOverview {
  title: string;
  monthLabel: string;
  weatherTitle: string;
  weatherSubtitle: string;
  weatherHint: string;
  savingsAmount: number;
  goalLabel: string;
}

export interface CalendarDayItem {
  dateKey: string;
  dayNumber: number;
  amount?: number;
  tone: 'primary' | 'mint' | 'gold' | 'rose';
  weatherTone?: CalendarWeatherTone;
  isCurrentMonth: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

export interface CalendarTransactionItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  time?: string;
  icon: string;
  iconTone: string;
  isFixedExpense?: boolean;
}

export interface CalendarTransactionGroup {
  id: string;
  dateLabel: string;
  dailySpent: number;
  items: CalendarTransactionItem[];
}

export interface CalendarDayDetail {
  dateKey: string;
  title: string;
  weatherLabel: string;
  weatherHint: string;
  weatherTemperature: string;
  spentAmount: number | null;
  transactionCount: number | null;
  memo: string;
  items: CalendarTransactionItem[];
}

export interface FixedExpenseItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  statusLabel: string;
  statusTone: 'done' | 'countdown' | 'pending';
  icon: string;
  iconTone: string;
  countLabel: string;
  isExpanded?: boolean;
  isEnabled: boolean;
}

/**
 * 캘린더 화면 전반에서 공유하는 mock 데이터.
 * API가 아직 없어서 화면 흐름과 상태 반영을 검증하는 기준 데이터로 사용한다.
 */
export const mockCalendarOverview: CalendarOverview = {
  title: '캘린더',
  monthLabel: '2025년 6월',
  weatherTitle: '구름 · 주의',
  weatherSubtitle: '오늘 소비 날씨',
  weatherHint: '외식 지출 패턴 감지됨',
  savingsAmount: 101000,
  goalLabel: '목표 달성 중',
};

export const mockCalendarDays: CalendarDayItem[] = [
  { dateKey: '2025-06-01', dayNumber: 1, amount: 12000, tone: 'rose', weatherTone: 'rainy', isCurrentMonth: true },
  { dateKey: '2025-06-02', dayNumber: 2, amount: 8500, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-03', dayNumber: 3, amount: 34000, tone: 'mint', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-04', dayNumber: 4, amount: 6000, tone: 'mint', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-05', dayNumber: 5, amount: 28000, tone: 'mint', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-06', dayNumber: 6, amount: 15000, tone: 'gold', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-07', dayNumber: 7, amount: 87000, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-08', dayNumber: 8, amount: 10000, tone: 'primary', weatherTone: 'rainy', isCurrentMonth: true },
  { dateKey: '2025-06-09', dayNumber: 9, amount: 5000, tone: 'gold', weatherTone: 'clear', isCurrentMonth: true },
  { dateKey: '2025-06-10', dayNumber: 10, amount: 18000, tone: 'rose', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-11', dayNumber: 11, amount: 55000, tone: 'mint', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-12', dayNumber: 12, amount: 0, tone: 'primary', weatherTone: 'clear', isCurrentMonth: true, isToday: true },
  { dateKey: '2025-06-13', dayNumber: 13, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-14', dayNumber: 14, tone: 'rose', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-15', dayNumber: 15, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-16', dayNumber: 16, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-17', dayNumber: 17, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-18', dayNumber: 18, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-19', dayNumber: 19, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-20', dayNumber: 20, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-21', dayNumber: 21, tone: 'rose', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-22', dayNumber: 22, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-23', dayNumber: 23, tone: 'rose', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-24', dayNumber: 24, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-25', dayNumber: 25, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-26', dayNumber: 26, tone: 'gold', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-27', dayNumber: 27, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-28', dayNumber: 28, tone: 'rose', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-29', dayNumber: 29, tone: 'mint', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-30', dayNumber: 30, tone: 'mint', isCurrentMonth: true, isFuture: true },
];

export const mockCalendarTransactions: CalendarTransactionGroup[] = [
  {
    id: '2025-06-12',
    dateLabel: '6월 12일 (목)',
    dailySpent: 407100,
    items: [
      { id: 'tx-12-1', title: '스타벅스', category: '식비', amount: 6800, time: '09:11', icon: 'cafe-outline', iconTone: '#F1E9E0' },
      { id: 'tx-12-2', title: '대중교통', category: '교통', amount: 2500, time: '08:22', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-12-3', title: '이마트 장보기', category: '식비', amount: 48000, time: '18:42', icon: 'cart-outline', iconTone: '#EEF4E2' },
      { id: 'tx-12-4', title: '급여 입금', category: '수입', amount: -2800000, time: '07:30', icon: 'wallet-outline', iconTone: '#EAF8E7' },
    ],
  },
  {
    id: '2025-06-11',
    dateLabel: '6월 11일 (수)',
    dailySpent: 112500,
    items: [
      { id: 'tx-11-1', title: '게임 결제', category: '여가', amount: 55000, time: '22:14', icon: 'game-controller-outline', iconTone: '#F1ECFF' },
      { id: 'tx-11-2', title: '스타벅스', category: '식비', amount: 6800, time: '10:05', icon: 'cafe-outline', iconTone: '#F1E9E0' },
      { id: 'tx-11-3', title: '대중교통', category: '교통', amount: 2500, time: '08:12', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-11-4', title: '이마트 장보기', category: '식비', amount: 18000, time: '20:11', icon: 'cart-outline', iconTone: '#EEF4E2' },
      { id: 'tx-11-5', title: '무명 주류', category: '식비', amount: 32000, time: '21:08', icon: 'wine-outline', iconTone: '#FDE7C7' },
    ],
  },
  {
    id: '2025-06-10',
    dateLabel: '6월 10일 (화)',
    dailySpent: 9300,
    items: [
      { id: 'tx-10-1', title: '대중교통', category: '교통', amount: 2500, time: '08:22', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-10-2', title: '스타벅스', category: '식비', amount: 6800, time: '10:05', icon: 'cafe-outline', iconTone: '#F1E9E0' },
    ],
  },
  {
    id: '2025-06-01',
    dateLabel: '6월 1일 (일)',
    dailySpent: 21500,
    items: [
      { id: 'tx-1-1', title: '편의점', category: '식비', amount: 12000, time: '11:05', icon: 'storefront-outline', iconTone: '#E9EEFF' },
      { id: 'tx-1-2', title: '카페', category: '식비', amount: 9500, time: '15:42', icon: 'cafe-outline', iconTone: '#F3EBDD' },
    ],
  },
];

export const mockCalendarDayDetails: Record<string, CalendarDayDetail> = {
  '2025-06-01': {
    dateKey: '2025-06-01',
    title: '6월 1일 (일)',
    weatherLabel: '맑음',
    weatherHint: '쾌청한 오전',
    weatherTemperature: '22°',
    spentAmount: 21500,
    transactionCount: 2,
    memo: '',
    items: [
      { id: 'detail-1', title: '편의점', category: '식비', amount: 12000, time: '11:05', icon: 'storefront-outline', iconTone: '#E9EEFF' },
      { id: 'detail-2', title: '카페', category: '식비', amount: 9500, time: '15:42', icon: 'cafe-outline', iconTone: '#F3EBDD' },
    ],
  },
  '2025-06-18': {
    dateKey: '2025-06-18',
    title: '6월 18일 (수)',
    weatherLabel: '정보 없음',
    weatherHint: '날씨 정보가 없습니다',
    weatherTemperature: '--°',
    spentAmount: null,
    transactionCount: null,
    memo: '',
    items: [],
  },
  '2025-06-19': {
    dateKey: '2025-06-19',
    title: '6월 19일 (목)',
    weatherLabel: '정보 없음',
    weatherHint: '날씨 정보가 없습니다',
    weatherTemperature: '--°',
    spentAmount: null,
    transactionCount: null,
    memo: '',
    items: [],
  },
  '2025-06-20': {
    dateKey: '2025-06-20',
    title: '6월 20일 (금)',
    weatherLabel: '정보 없음',
    weatherHint: '날씨 정보가 없습니다',
    weatherTemperature: '--°',
    spentAmount: null,
    transactionCount: null,
    memo: '',
    items: [],
  },
};

export const mockFixedExpensesTotal = 91900;

export const mockFixedExpenses: FixedExpenseItem[] = [
  {
    id: 'housing',
    title: '주거',
    subtitle: '0개 항목',
    amount: 0,
    statusLabel: '납부완료',
    statusTone: 'done',
    icon: 'home-outline',
    iconTone: '#F3EBDD',
    countLabel: '0개 항목',
    isEnabled: false,
  },
  {
    id: 'subscription',
    title: '구독서비스',
    subtitle: '2개 항목',
    amount: 31900,
    statusLabel: 'D-3',
    statusTone: 'countdown',
    icon: 'desktop-outline',
    iconTone: '#EEF1FF',
    countLabel: '2개 항목',
    isEnabled: true,
  },
  {
    id: 'leisure',
    title: '여가',
    subtitle: '1개 항목',
    amount: 60000,
    statusLabel: 'D-19',
    statusTone: 'countdown',
    icon: 'game-controller-outline',
    iconTone: '#F1ECFF',
    countLabel: '1개 항목',
    isExpanded: true,
    isEnabled: true,
  },
  {
    id: 'fitness',
    title: '헬스장',
    subtitle: '매월 1일 자동이체',
    amount: 60000,
    statusLabel: 'D-19',
    statusTone: 'countdown',
    icon: 'barbell-outline',
    iconTone: '#FFF5E8',
    countLabel: '매월 자동이체',
    isEnabled: true,
  },
  {
    id: 'phone',
    title: '통신',
    subtitle: '0개 항목',
    amount: 0,
    statusLabel: '',
    statusTone: 'pending',
    icon: 'phone-portrait-outline',
    iconTone: '#F7F1D9',
    countLabel: '0개 항목',
    isEnabled: false,
  },
];

export const mockManageFixedExpenses = [
  {
    id: 'rent',
    title: '월세',
    subtitle: '매월 5일 · 주거',
    amount: 456789,
    icon: 'home-outline',
    iconTone: '#F3EBDD',
    isEnabled: false,
  },
  {
    id: 'netflix',
    title: '넷플릭스',
    subtitle: '매월 5일 · 구독서비스',
    amount: 17000,
    icon: 'tv-outline',
    iconTone: '#111111',
    isEnabled: true,
  },
  {
    id: 'youtube',
    title: '유튜브 프리미엄',
    subtitle: '매월 10일 · 구독서비스',
    amount: 14900,
    icon: 'logo-youtube',
    iconTone: '#EEF1FF',
    isEnabled: true,
  },
  {
    id: 'gym',
    title: '헬스장',
    subtitle: '매월 1일 · 헬스',
    amount: 60000,
    icon: 'barbell-outline',
    iconTone: '#FFF5E8',
    isEnabled: false,
  },
  {
    id: 'mobile',
    title: '통신비',
    subtitle: '매월 15일 · 통신',
    amount: 55000,
    icon: 'phone-portrait-outline',
    iconTone: '#F7F1D9',
    isEnabled: false,
  },
];

export const mockSelectableTransactions = [
  { id: 'pick-1', dateLabel: '2025-06-12', title: '대중교통', category: '교통', amount: 2500, icon: 'train-outline', iconTone: '#DBEAFE' },
  { id: 'pick-2', dateLabel: '2025-06-12', title: '이마트 장보기', category: '식비', amount: 48000, icon: 'cart-outline', iconTone: '#EEF4E2' },
  { id: 'pick-3', dateLabel: '2025-06-11', title: '게임 결제', category: '여가', amount: 55000, icon: 'game-controller-outline', iconTone: '#F1ECFF' },
  { id: 'pick-4', dateLabel: '2025-06-10', title: '이마트', category: '식비', amount: 18000, icon: 'cart-outline', iconTone: '#EEF4E2' },
  { id: 'pick-5', dateLabel: '2025-06-01', title: '편의점', category: '식비', amount: 12000, icon: 'storefront-outline', iconTone: '#E9EEFF' },
  { id: 'pick-6', dateLabel: '2025-06-01', title: '카페', category: '식비', amount: 9500, icon: 'cafe-outline', iconTone: '#F3EBDD' },
];

export const mockHomeCalendarPreview = mockCalendarDays.slice(0, 7);
