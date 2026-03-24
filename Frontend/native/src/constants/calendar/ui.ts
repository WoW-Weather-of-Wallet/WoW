import { Ionicons } from '@expo/vector-icons';
import type { CalendarWeatherTone } from '../../mock/calendar';

// 캘린더 화면 전반에서 공통으로 쓰는 정적 UI 설정값 모음.
export const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const CALENDAR_TAB_OPTIONS = [
  { key: 'calendar', label: '캘린더', icon: 'calendar-outline' as const },
  { key: 'history', label: '전체내역', icon: 'receipt-outline' as const },
] as const;

export const WEATHER_ICONS: Record<
  CalendarWeatherTone,
  keyof typeof Ionicons.glyphMap
> = {
  rainy: 'rainy-outline',
  cloudy: 'partly-sunny-outline',
  sunny: 'sunny-outline',
  clear: 'moon-outline',
};
