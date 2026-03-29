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
  hasMemo?: boolean;
  isCurrentMonth: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}

export interface CalendarTransactionItem {
  id: string;
  backendTransactionId?: number;
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
  weatherIconCode?: string | null;
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

export const mockCalendarOverview: CalendarOverview = {
  title: '캘린더',
  monthLabel: '2025년 6월',
  weatherTitle: '구름 · 주의',
  weatherSubtitle: '2025년 6월',
  weatherHint: '외식 지출 패턴 감지됨',
  savingsAmount: 101000,
  goalLabel: '목표 달성 중',
};

export const mockCalendarDays: CalendarDayItem[] = [
  { dateKey: '2025-06-01', dayNumber: 1, amount: 21500, tone: 'rose', weatherTone: 'rainy', isCurrentMonth: true },
  { dateKey: '2025-06-02', dayNumber: 2, amount: 8500, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-03', dayNumber: 3, amount: 36500, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-04', dayNumber: 4, amount: 6000, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-05', dayNumber: 5, amount: 28000, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-06', dayNumber: 6, amount: 15000, tone: 'gold', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-07', dayNumber: 7, amount: 87000, tone: 'mint', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-08', dayNumber: 8, amount: 10000, tone: 'primary', weatherTone: 'rainy', isCurrentMonth: true },
  { dateKey: '2025-06-09', dayNumber: 9, amount: 55000, tone: 'gold', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-10', dayNumber: 10, amount: 27300, tone: 'rose', weatherTone: 'sunny', isCurrentMonth: true },
  { dateKey: '2025-06-11', dayNumber: 11, amount: 53000, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true },
  { dateKey: '2025-06-12', dayNumber: 12, amount: 57100, tone: 'primary', weatherTone: 'cloudy', isCurrentMonth: true, isToday: true },
  { dateKey: '2025-06-13', dayNumber: 13, amount: 0, tone: 'mint', weatherTone: 'cloudy', isCurrentMonth: true, isFuture: true },
  { dateKey: '2025-06-14', dayNumber: 14, amount: 0, tone: 'rose', weatherTone: 'clear', isCurrentMonth: true, isFuture: true },
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
      { id: 'tx-12-1', title: '스타벅스 강남점', category: '커피/음료', amount: 6800, time: '09:11', icon: 'cafe-outline', iconTone: '#F1E9E0' },
      { id: 'tx-12-2', title: '지하철 교통카드', category: '교통서비스', amount: 1350, time: '08:22', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-12-3', title: '쿠팡', category: '인터넷쇼핑', amount: 45000, time: '18:42', icon: 'cart-outline', iconTone: '#EEF4E2' },
      { id: 'tx-12-4', title: '배민라이더스', category: '외식', amount: 18500, time: '19:35', icon: 'restaurant-outline', iconTone: '#FDE2E2' },
      { id: 'tx-12-5', title: '올리브영', category: '화장품소매', amount: 8500, time: '20:11', icon: 'medical-outline', iconTone: '#FFE8F1' },
      { id: 'tx-12-6', title: '월급', category: '수리서비스', amount: -2800000, time: '07:30', icon: 'wallet-outline', iconTone: '#EAF8E7' },
    ],
  },
  {
    id: '2025-06-11',
    dateLabel: '6월 11일 (수)',
    dailySpent: 112500,
    items: [
      { id: 'tx-11-1', title: 'CGV 영화', category: '공연관람', amount: 15000, time: '22:14', icon: 'game-controller-outline', iconTone: '#F1ECFF' },
      { id: 'tx-11-2', title: '스타벅스 강남점', category: '커피/음료', amount: 6800, time: '10:05', icon: 'cafe-outline', iconTone: '#F1E9E0' },
      { id: 'tx-11-3', title: '지하철 교통카드', category: '교통서비스', amount: 2500, time: '08:12', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-11-4', title: '쿠팡', category: '인터넷쇼핑', amount: 18000, time: '20:11', icon: 'cart-outline', iconTone: '#EEF4E2' },
      { id: 'tx-11-5', title: '맥주 한잔', category: '육류/회식', amount: 32000, time: '21:08', icon: 'wine-outline', iconTone: '#FDE7C7' },
    ],
  },
  {
    id: '2025-06-10',
    dateLabel: '6월 10일 (화)',
    dailySpent: 9300,
    items: [
      { id: 'tx-10-1', title: '지하철 교통카드', category: '교통서비스', amount: 2500, time: '08:22', icon: 'train-outline', iconTone: '#DBEAFE' },
      { id: 'tx-10-2', title: '스타벅스 강남점', category: '커피/음료', amount: 6800, time: '10:05', icon: 'cafe-outline', iconTone: '#F1E9E0' },
    ],
  },
  {
    id: '2025-06-01',
    dateLabel: '6월 1일 (일)',
    dailySpent: 21500,
    items: [
      { id: 'tx-1-1', title: '편의점', category: '음/식료품소매', amount: 12000, time: '11:05', icon: 'storefront-outline', iconTone: '#E9EEFF' },
      { id: 'tx-1-2', title: '카페', category: '커피/음료', amount: 9500, time: '15:42', icon: 'cafe-outline', iconTone: '#F3EBDD' },
    ],
  },
];

export const mockCalendarDayDetails: Record<string, CalendarDayDetail> = {
  '2025-06-01': {
    dateKey: '2025-06-01',
    title: '6월 1일 (일)',
    weatherLabel: '비 소식',
    weatherHint: '실내 소비가 늘 수 있어요.',
    weatherTemperature: '22도',
    spentAmount: 21500,
    transactionCount: 2,
    memo: '장보기와 카페 지출이 겹쳐서 예상보다 지출이 컸다.',
    items: [
      { id: 'detail-1', title: '편의점', category: '음/식료품소매', amount: 12000, time: '11:05', icon: 'storefront-outline', iconTone: '#E9EEFF' },
      { id: 'detail-2', title: '카페', category: '커피/음료', amount: 9500, time: '15:42', icon: 'cafe-outline', iconTone: '#F3EBDD' },
    ],
  },
  '2025-06-18': {
    dateKey: '2025-06-18',
    title: '6월 18일 (수)',
    weatherLabel: '예정 지출 없음',
    weatherHint: '아직 등록된 내역이 없어요.',
    weatherTemperature: '',
    spentAmount: null,
    transactionCount: null,
    memo: '다음 주 정기결제 전에 잔액 확인 필요.',
    items: [],
  },
  '2025-06-19': {
    dateKey: '2025-06-19',
    title: '6월 19일 (목)',
    weatherLabel: '예정 지출 없음',
    weatherHint: '아직 등록된 내역이 없어요.',
    weatherTemperature: '',
    spentAmount: null,
    transactionCount: null,
    memo: '',
    items: [],
  },
  '2025-06-20': {
    dateKey: '2025-06-20',
    title: '6월 20일 (금)',
    weatherLabel: '예정 지출 없음',
    weatherHint: '아직 등록된 내역이 없어요.',
    weatherTemperature: '',
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
    title: '인테리어/가정용품',
    subtitle: '0건',
    amount: 0,
    statusLabel: '등록 전',
    statusTone: 'done',
    icon: 'home-outline',
    iconTone: '#F3EBDD',
    countLabel: '0건',
    isEnabled: false,
  },
  {
    id: 'subscription',
    title: '시스템/통신',
    subtitle: '2건',
    amount: 31900,
    statusLabel: 'D-3',
    statusTone: 'countdown',
    icon: 'desktop-outline',
    iconTone: '#EEF1FF',
    countLabel: '2건',
    isEnabled: true,
  },
  {
    id: 'leisure',
    title: '공연관람',
    subtitle: '1건',
    amount: 60000,
    statusLabel: 'D-19',
    statusTone: 'countdown',
    icon: 'game-controller-outline',
    iconTone: '#F1ECFF',
    countLabel: '1건',
    isExpanded: true,
    isEnabled: true,
  },
  {
    id: 'fitness',
    title: '건강/뷰티/마사지',
    subtitle: '매월 1회 등록',
    amount: 60000,
    statusLabel: 'D-19',
    statusTone: 'countdown',
    icon: 'barbell-outline',
    iconTone: '#FFF5E8',
    countLabel: '매월 자동 반영',
    isEnabled: true,
  },
  {
    id: 'phone',
    title: '시스템/통신',
    subtitle: '0건',
    amount: 0,
    statusLabel: '',
    statusTone: 'pending',
    icon: 'phone-portrait-outline',
    iconTone: '#F7F1D9',
    countLabel: '0건',
    isEnabled: false,
  },
];

export const mockManageFixedExpenses = [
  {
    id: 'rent',
    title: '월세',
    subtitle: '매월 5일 인테리어/가정용품',
    amount: 456789,
    icon: 'home-outline',
    iconTone: '#F3EBDD',
    isEnabled: false,
  },
  {
    id: 'netflix',
    title: '넷플릭스',
    subtitle: '매월 5일 시스템/통신',
    amount: 17000,
    icon: 'tv-outline',
    iconTone: '#111111',
    isEnabled: true,
  },
  {
    id: 'youtube',
    title: '유튜브 프리미엄',
    subtitle: '매월 10일 시스템/통신',
    amount: 14900,
    icon: 'logo-youtube',
    iconTone: '#EEF1FF',
    isEnabled: true,
  },
  {
    id: 'gym',
    title: '헬스장',
    subtitle: '매월 1일 건강/뷰티/마사지',
    amount: 60000,
    icon: 'barbell-outline',
    iconTone: '#FFF5E8',
    isEnabled: false,
  },
  {
    id: 'mobile',
    title: '휴대폰 요금',
    subtitle: '매월 15일 시스템/통신',
    amount: 55000,
    icon: 'phone-portrait-outline',
    iconTone: '#F7F1D9',
    isEnabled: false,
  },
];

export const mockSelectableTransactions = [
  { id: 'pick-1', dateLabel: '2025-06-12', title: '지하철 교통카드', category: '교통서비스', amount: 2500, icon: 'train-outline', iconTone: '#DBEAFE' },
  { id: 'pick-2', dateLabel: '2025-06-12', title: '쿠팡', category: '인터넷쇼핑', amount: 48000, icon: 'cart-outline', iconTone: '#EEF4E2' },
  { id: 'pick-3', dateLabel: '2025-06-11', title: 'CGV 영화', category: '공연관람', amount: 55000, icon: 'game-controller-outline', iconTone: '#F1ECFF' },
  { id: 'pick-4', dateLabel: '2025-06-10', title: '올리브영', category: '화장품소매', amount: 18000, icon: 'medical-outline', iconTone: '#FFE8F1' },
  { id: 'pick-5', dateLabel: '2025-06-01', title: '편의점', category: '음/식료품소매', amount: 12000, icon: 'storefront-outline', iconTone: '#E9EEFF' },
  { id: 'pick-6', dateLabel: '2025-06-01', title: '카페', category: '커피/음료', amount: 9500, icon: 'cafe-outline', iconTone: '#F3EBDD' },
];

export const mockHomeCalendarPreview = mockCalendarDays.slice(0, 7);
