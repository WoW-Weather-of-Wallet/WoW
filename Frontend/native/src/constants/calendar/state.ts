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

/**
 * 고정지출 등록 시 카테고리별 대표 아이콘과 톤을 재사용합니다.
 */
export const CATEGORY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconTone: string }
> = {
  식비: { icon: 'restaurant-outline', iconTone: '#FDE2E2' },
  교통: { icon: 'train-outline', iconTone: '#DBEAFE' },
  쇼핑: { icon: 'cart-outline', iconTone: '#EEF4E2' },
  여가: { icon: 'game-controller-outline', iconTone: '#F1ECFF' },
  주거: { icon: 'home-outline', iconTone: '#F3EBDD' },
  의료: { icon: 'medical-outline', iconTone: '#FFE8F1' },
  통신: { icon: 'phone-portrait-outline', iconTone: '#F7F1D9' },
  기타: { icon: 'wallet-outline', iconTone: '#ECECEC' },
};

/**
 * mock subtitle에서 카테고리만 뽑아 관리 화면 초기 상태에 연결합니다.
 */
export function extractCategoryFromSubtitle(subtitle: string) {
  const fragments = subtitle.split('일 ·');
  return fragments.length > 1 ? fragments[1].trim() : '기타';
}

/**
 * 날짜 상세 시트와 히스토리 헤더가 같은 표기를 쓰도록 날짜 문자열을 통일합니다.
 */
export function formatDateTitle(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/**
 * mock이 없는 날짜를 눌렀을 때도 상세 시트가 자연스럽게 열리도록 기본값을 만듭니다.
 */
export function buildFallbackDetail(dateKey: string): CalendarDayDetail {
  return {
    dateKey,
    title: formatDateTitle(dateKey),
    weatherLabel: '정보 없음',
    weatherHint: '날씨 정보가 없습니다',
    weatherTemperature: '--°',
    spentAmount: null,
    transactionCount: null,
    memo: '',
    items: [],
  };
}

const BASE_MONTH_DATE = new Date(2025, 5, 1);
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const TONE_SEQUENCE: CalendarDayItem['tone'][] = ['rose', 'mint', 'gold', 'primary'];

/**
 * 캘린더는 2025년 6월 mock을 기준으로 월 offset만 바꾸며 표시 월을 계산합니다.
 */
export function createDisplayedMonth(offset: number) {
  return new Date(BASE_MONTH_DATE.getFullYear(), BASE_MONTH_DATE.getMonth() + offset, 1);
}

/**
 * 히어로 카드와 전체내역 헤더가 같은 월 포맷을 공유하도록 헬퍼를 분리했습니다.
 */
export function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${MONTH_NAMES[date.getMonth()]}`;
}

/**
 * mock 데이터가 없는 달도 달력 그리드는 보여야 해서 패딩 셀과 날짜 셀을 함께 생성합니다.
 */
export function buildMonthDays(
  displayedMonth: Date,
  today: Date,
  sourceDaysByKey: Map<string, CalendarDayItem>,
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
      sourceDay ?? {
        dateKey,
        dayNumber,
        tone: TONE_SEQUENCE[(dayNumber - 1) % TONE_SEQUENCE.length],
        isCurrentMonth: true,
        isFuture,
      },
    );
  }

  return calendarDays;
}
