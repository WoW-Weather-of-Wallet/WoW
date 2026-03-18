import { Ionicons } from '@expo/vector-icons';

export type CalendarEntryCategoryKey =
  | '식비'
  | '교통'
  | '쇼핑'
  | '여가'
  | '의료'
  | '통신'
  | '주거'
  | '기타';

export const CALENDAR_ENTRY_CATEGORIES: Array<{
  key: CalendarEntryCategoryKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: '식비', label: '식비', icon: 'restaurant-outline' },
  { key: '교통', label: '교통', icon: 'bus-outline' },
  { key: '쇼핑', label: '쇼핑', icon: 'bag-handle-outline' },
  { key: '여가', label: '여가', icon: 'game-controller-outline' },
  { key: '의료', label: '의료', icon: 'medical-outline' },
  { key: '통신', label: '통신', icon: 'phone-portrait-outline' },
  { key: '주거', label: '주거', icon: 'home-outline' },
  { key: '기타', label: '기타', icon: 'pricetag-outline' },
];

export const CALENDAR_EXCEL_BANKS = ['신한', '국민', '카카오뱅크', '하나', '우리'] as const;
