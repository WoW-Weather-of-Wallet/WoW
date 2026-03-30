import { Ionicons } from '@expo/vector-icons';
import {
  CALENDAR_ENTRY_CATEGORIES,
  DEFAULT_CALENDAR_CATEGORY,
} from './addEntry';
import type { CalendarDayDetail, CalendarDayItem } from '../../mock/calendar';

export interface ManageFixedExpenseItem {
  id: string;
  fixedExpenseId?: number;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  iconTone: string;
  isEnabled: boolean;
  category: string;
  paymentStatus?: string;
  sourceTransactionId?: string;
  paymentDay?: number;
}

const CATEGORY_ICON_TONES: Record<string, string> = {
  인터넷쇼핑: '#EEF4E2',
  '인테리어/가정용품': '#F3EBDD',
  교통서비스: '#DBEAFE',
  '음/식료품소매': '#E9EEFF',
  외식: '#FDE2E2',
  '제과/제빵/떡/케익': '#FDE7C7',
  '커피/음료': '#F1E9E0',
  패스트푸드: '#FFE7D6',
  '자동차/유지비': '#E5EEF8',
  '시스템/통신': '#F7F1D9',
  '건강/기호식품': '#EAF8E7',
  분식: '#FFE9E2',
  '육류/회식': '#F3D7D3',
  '선물/완구': '#F8E7F7',
  '병원/의료': '#FFE8F1',
  화장품소매: '#FCE7F3',
  공연관람: '#F1ECFF',
  '의약/의료품': '#FDEDED',
  '건강/뷰티/마사지': '#FFF5E8',
  수리서비스: '#ECECEC',
};

export const CATEGORY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconTone: string }
> = CALENDAR_ENTRY_CATEGORIES.reduce((acc, category) => {
  acc[category.key] = {
    icon: category.icon,
    iconTone: CATEGORY_ICON_TONES[category.key] ?? '#ECECEC',
  };
  return acc;
}, {} as Record<string, { icon: keyof typeof Ionicons.glyphMap; iconTone: string }>);

export function extractCategoryFromSubtitle(subtitle: string) {
  const knownCategories = Object.keys(CATEGORY_META);
  const matched = knownCategories.find((category) => subtitle.includes(category));
  return matched ?? DEFAULT_CALENDAR_CATEGORY;
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
    weatherHint: '거래를 추가하면 이 날짜의 소비 흐름이 여기에 표시돼요.',
    weatherIconCode: null,
    weatherTemperature: '',
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

export function resolveDisplayedMonthOffset(targetDate: Date) {
  return (
    (targetDate.getFullYear() - BASE_MONTH_DATE.getFullYear()) * 12
    + (targetDate.getMonth() - BASE_MONTH_DATE.getMonth())
  );
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
