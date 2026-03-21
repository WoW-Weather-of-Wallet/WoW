import { Ionicons } from '@expo/vector-icons';
import type { CalendarDayDetail, CalendarDayItem } from '../../mock/calendar';

export interface ManageFixedExpenseItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  iconTone: string;
  isEnabled: boolean;
  category: string;
  sourceTransactionId?: string;
  paymentDay?: number;
}

export const CATEGORY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconTone: string }
> = {
  식비: { icon: 'restaurant-outline', iconTone: '#FDE2E2' },
  교통: { icon: 'bus-outline', iconTone: '#DBEAFE' },
  쇼핑: { icon: 'bag-handle-outline', iconTone: '#EEF4E2' },
  여가: { icon: 'game-controller-outline', iconTone: '#F1ECFF' },
  주거: { icon: 'home-outline', iconTone: '#F3EBDD' },
  의료: { icon: 'medical-outline', iconTone: '#FFE8F1' },
  통신: { icon: 'phone-portrait-outline', iconTone: '#F7F1D9' },
  기타: { icon: 'wallet-outline', iconTone: '#ECECEC' },
};

export function extractCategoryFromSubtitle(subtitle: string) {
  const knownCategories = Object.keys(CATEGORY_META);
  const matched = knownCategories.find((category) => subtitle.includes(category));
  return matched ?? '기타';
}

export function formatDateTitle(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(year, month - 1, day).getDay()
  ];
  return `${month}월 ${day}일 (${weekday})`;
}

export function buildFallbackDetail(
  dateKey: string,
  items: CalendarDayDetail['items'] = [],
): CalendarDayDetail {
  return {
    dateKey,
    title: formatDateTitle(dateKey),
    weatherLabel: '소비 예정 없음',
    weatherHint: '등록된 거래 내역이 없어요.',
    weatherTemperature: '--',
    spentAmount: items.length > 0 ? items.reduce((sum, item) => sum + Math.max(item.amount, 0), 0) : null,
    transactionCount: items.length > 0 ? items.length : null,
    memo: '',
    items,
  };
}

// Default the calendar to the real current month so live header data appears
// as soon as the user opens the screen.
const currentDate = new Date();
const BASE_MONTH_DATE = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

export function createDisplayedMonth(offset: number) {
  return new Date(BASE_MONTH_DATE.getFullYear(), BASE_MONTH_DATE.getMonth() + offset, 1);
}

export function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

const TONE_SEQUENCE: CalendarDayItem['tone'][] = ['rose', 'mint', 'gold', 'primary'];

export function buildMonthDays(
  displayedMonth: Date,
  today: Date,
  sourceDaysByKey: Map<string, CalendarDayItem>,
  memoDateKeys: Set<string>,
) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const calendarDays: CalendarDayItem[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    calendarDays.push({
      dateKey: `padding-${year}-${month}-${index}`,
      dayNumber: 0,
      tone: 'mint',
      isCurrentMonth: false,
    });
  }

  for (let dayNumber = 1; dayNumber <= lastDate; dayNumber += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const sourceDay = sourceDaysByKey.get(dateKey);
    const targetDate = new Date(year, month, dayNumber);
    const isFuture = targetDate > today;

    calendarDays.push(
      sourceDay
        ? {
            ...sourceDay,
            hasMemo: memoDateKeys.has(dateKey),
          }
        : {
            dateKey,
            dayNumber,
            tone: TONE_SEQUENCE[(dayNumber - 1) % TONE_SEQUENCE.length],
            hasMemo: memoDateKeys.has(dateKey),
            isCurrentMonth: true,
            isFuture,
          },
    );
  }

  return calendarDays;
}
