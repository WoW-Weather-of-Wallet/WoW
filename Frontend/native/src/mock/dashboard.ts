// =============================================
// dashboard mock data
// 메인/마이페이지는 아직 백엔드 연결 전 단계이므로
// 화면 구조와 상태 흐름을 먼저 검증하기 위한 더미 데이터를 둡니다.
// =============================================

import { COLORS } from '../constants/theme';

export interface HomeInsight {
  id: string;
  label: string;
  value: string;
  changeText: string;
  tone: 'positive' | 'neutral' | 'warning';
}

export interface HomeSpendingCategory {
  id: string;
  label: string;
  amount: number;
  ratio: number;
  icon: string;
  color: string;
}

export interface HomeScheduleItem {
  id: string;
  title: string;
  dueLabel: string;
  amount: string;
  status: 'upcoming' | 'paid';
}

export interface UserShortcut {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MyCardSummary {
  id: string;
  cardName: string;
  cardType: string;
  ownerName: string;
  lastDigits: string;
  themeStart: string;
  themeEnd: string;
  billingDay: string;
}

export interface MyAccountSummary {
  id: string;
  bankName: string;
  accountAlias: string;
  accountNumberMasked: string;
  balance: number;
  tone: 'primary' | 'mint' | 'gold';
}

export const mockHomeSummary = {
  userName: '채목',
  monthLabel: '3월',
  budgetUsageRate: 68,
  remainingBudget: 432000,
  totalBudget: 1350000,
  spentAmount: 918000,
  forecastText: '이번 주만 잘 지키면 예산 내로 마감 가능해요.',
  monthSpentAmount: 640000,
  monthlyBudget: 500000,
  monthlyForecastRate: 62,
  budgetUsedAmount: 311000,
  todaySpentAmount: 19900,
  updatedAt: '10:00 pm',
  dailyChangeAmount: -4200,
  scheduledPaymentAmount: 101000,
  scheduledPaymentHint: '지금 페이스라면',
  spendingTypeDescription: '외식과 커피/음료 비중이 높아요. 경험과 맛에 적극 투자하는 라이프스타일!',
};

export const mockHomeInsights: HomeInsight[] = [
  {
    id: 'weekly-forecast',
    label: '이번 주 지출 예보',
    value: '212,000원',
    changeText: '지난주 대비 12% 감소',
    tone: 'positive',
  },
  {
    id: 'fixed-expense',
    label: '고정 지출 예정',
    value: '487,000원',
    changeText: '3건 결제 예정',
    tone: 'neutral',
  },
  {
    id: 'risk-alert',
    label: '지출 위험 구간',
    value: '외식',
    changeText: '예산 대비 88% 사용',
    tone: 'warning',
  },
];

export const mockSpendingCategories: HomeSpendingCategory[] = [
  {
    id: 'dining-out',
    label: '외식',
    amount: 402000,
    ratio: 0.88,
    icon: 'restaurant-outline',
    color: COLORS.warning,
  },
  {
    id: 'transport',
    label: '교통서비스',
    amount: 124000,
    ratio: 0.52,
    icon: 'subway-outline',
    color: COLORS.chartBlue,
  },
  {
    id: 'shopping',
    label: '인터넷쇼핑',
    amount: 198000,
    ratio: 0.61,
    icon: 'bag-handle-outline',
    color: COLORS.primaryLight,
  },
  {
    id: 'cafe',
    label: '커피/음료',
    amount: 71000,
    ratio: 0.34,
    icon: 'cafe-outline',
    color: COLORS.chartGreen,
  },
];

export const mockScheduleItems: HomeScheduleItem[] = [
  { id: 'netflix', title: '넷플릭스', dueLabel: '3월 12일 자동 결제', amount: '17,000원', status: 'upcoming' },
  { id: 'phone', title: '통신비', dueLabel: '3월 14일 자동 이체', amount: '89,000원', status: 'upcoming' },
  { id: 'rent', title: '월세', dueLabel: '3월 5일 납부 완료', amount: '450,000원', status: 'paid' },
];

export const mockUserProfile = {
  name: '이채목',
  badge: 'SSAFY 금융 14기',
  linkedAccounts: 4,
  onboardingCompleted: true,
};

export const mockMyCards: MyCardSummary[] = [
  {
    id: 'card-1',
    cardName: 'WOW 체크카드',
    cardType: '체크카드',
    ownerName: '이채목',
    lastDigits: '2031',
    themeStart: COLORS.primary,
    themeEnd: COLORS.primaryLight,
    billingDay: '매월 12일 결제',
  },
  {
    id: 'card-2',
    cardName: 'SSAFY 라이프 카드',
    cardType: '신용카드',
    ownerName: '이채목',
    lastDigits: '7814',
    themeStart: '#2C355B',
    themeEnd: '#54638F',
    billingDay: '매월 25일 결제',
  },
];

export const mockMyAccounts: MyAccountSummary[] = [
  {
    id: 'account-1',
    bankName: '신한은행',
    accountAlias: '생활비 통장',
    accountNumberMasked: '110-***-203184',
    balance: 842000,
    tone: 'primary',
  },
  {
    id: 'account-2',
    bankName: '카카오뱅크',
    accountAlias: '비상금 통장',
    accountNumberMasked: '3333-**-8201442',
    balance: 315000,
    tone: 'mint',
  },
  {
    id: 'account-3',
    bankName: '토스뱅크',
    accountAlias: '저축 목표 통장',
    accountNumberMasked: '1000-***-552901',
    balance: 1260000,
    tone: 'gold',
  },
];

export const mockUserShortcuts: UserShortcut[] = [
  {
    id: 'account',
    title: '연결 계좌 관리',
    description: '계좌 연동 상태와 잔액 연결 여부를 확인해요.',
    icon: 'wallet-outline',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    description: '지출 경고, 예산 초과, 결제 예정 알림을 조절해요.',
    icon: 'notifications-outline',
  },
  {
    id: 'security',
    title: '보안 설정',
    description: '간편 비밀번호와 생체 인증 사용 여부를 관리해요.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'support',
    title: '문의 및 도움말',
    description: '서비스 이용 중 막히는 부분을 빠르게 확인해요.',
    icon: 'help-circle-outline',
  },
];

export const mockProfileStats = [
  { id: 'accounts', label: '연결 계좌', value: '4개' },
  { id: 'rules', label: '보유 카드', value: '2장' },
  { id: 'reports', label: '이번 달 리포트', value: '준비됨' },
];
