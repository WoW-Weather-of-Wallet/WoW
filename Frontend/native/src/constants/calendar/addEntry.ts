import { Ionicons } from '@expo/vector-icons';

export type CalendarEntryCategoryKey =
  | '인터넷쇼핑'
  | '인테리어/가정용품'
  | '교통서비스'
  | '음/식료품소매'
  | '외식'
  | '제과/제빵/떡/케익'
  | '커피/음료'
  | '패스트푸드'
  | '자동차/유지비'
  | '시스템/통신'
  | '건강/기호식품'
  | '분식'
  | '육류/회식'
  | '선물/완구'
  | '병원/의료'
  | '화장품소매'
  | '공연관람'
  | '의약/의료품'
  | '건강/뷰티/마사지'
  | '수리서비스';

export const DEFAULT_CALENDAR_CATEGORY: CalendarEntryCategoryKey = '외식';

export interface CalendarEntryCategoryOption {
  key: CalendarEntryCategoryKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const CALENDAR_ENTRY_CATEGORIES: CalendarEntryCategoryOption[] = [
  { key: '인터넷쇼핑', label: '인터넷쇼핑', icon: 'bag-handle-outline' },
  { key: '인테리어/가정용품', label: '인테리어/가정용품', icon: 'home-outline' },
  { key: '교통서비스', label: '교통서비스', icon: 'bus-outline' },
  { key: '음/식료품소매', label: '음/식료품소매', icon: 'storefront-outline' },
  { key: '외식', label: '외식', icon: 'restaurant-outline' },
  { key: '제과/제빵/떡/케익', label: '제과/제빵/떡/케익', icon: 'nutrition-outline' },
  { key: '커피/음료', label: '커피/음료', icon: 'cafe-outline' },
  { key: '패스트푸드', label: '패스트푸드', icon: 'fast-food-outline' },
  { key: '자동차/유지비', label: '자동차/유지비', icon: 'car-outline' },
  { key: '시스템/통신', label: '시스템/통신', icon: 'phone-portrait-outline' },
  { key: '건강/기호식품', label: '건강/기호식품', icon: 'leaf-outline' },
  { key: '분식', label: '분식', icon: 'restaurant-outline' },
  { key: '육류/회식', label: '육류/회식', icon: 'wine-outline' },
  { key: '선물/완구', label: '선물/완구', icon: 'gift-outline' },
  { key: '병원/의료', label: '병원/의료', icon: 'medical-outline' },
  { key: '화장품소매', label: '화장품소매', icon: 'color-palette-outline' },
  { key: '공연관람', label: '공연관람', icon: 'film-outline' },
  { key: '의약/의료품', label: '의약/의료품', icon: 'medkit-outline' },
  { key: '건강/뷰티/마사지', label: '건강/뷰티/마사지', icon: 'body-outline' },
  { key: '수리서비스', label: '수리서비스', icon: 'construct-outline' },
];

const CATEGORY_OPTION_BY_KEY = CALENDAR_ENTRY_CATEGORIES.reduce<
  Record<CalendarEntryCategoryKey, CalendarEntryCategoryOption>
>((accumulator, category) => {
  accumulator[category.key] = category;
  return accumulator;
}, {} as Record<CalendarEntryCategoryKey, CalendarEntryCategoryOption>);

export const CALENDAR_ENTRY_CATEGORY_GROUPS: Array<{
  key: string;
  label: string;
  items: CalendarEntryCategoryOption[];
}> = [
  {
    key: 'food',
    label: '식음료',
    items: [
      CATEGORY_OPTION_BY_KEY['음/식료품소매'],
      CATEGORY_OPTION_BY_KEY['외식'],
      CATEGORY_OPTION_BY_KEY['제과/제빵/떡/케익'],
      CATEGORY_OPTION_BY_KEY['커피/음료'],
      CATEGORY_OPTION_BY_KEY['패스트푸드'],
      CATEGORY_OPTION_BY_KEY['분식'],
      CATEGORY_OPTION_BY_KEY['육류/회식'],
    ],
  },
  {
    key: 'lifestyle',
    label: '생활',
    items: [
      CATEGORY_OPTION_BY_KEY['인터넷쇼핑'],
      CATEGORY_OPTION_BY_KEY['인테리어/가정용품'],
      CATEGORY_OPTION_BY_KEY['시스템/통신'],
      CATEGORY_OPTION_BY_KEY['수리서비스'],
    ],
  },
  {
    key: 'mobility',
    label: '이동',
    items: [
      CATEGORY_OPTION_BY_KEY['교통서비스'],
      CATEGORY_OPTION_BY_KEY['자동차/유지비'],
    ],
  },
  {
    key: 'health',
    label: '건강',
    items: [
      CATEGORY_OPTION_BY_KEY['건강/기호식품'],
      CATEGORY_OPTION_BY_KEY['병원/의료'],
      CATEGORY_OPTION_BY_KEY['의약/의료품'],
      CATEGORY_OPTION_BY_KEY['건강/뷰티/마사지'],
    ],
  },
  {
    key: 'culture',
    label: '문화/기타',
    items: [
      CATEGORY_OPTION_BY_KEY['화장품소매'],
      CATEGORY_OPTION_BY_KEY['공연관람'],
      CATEGORY_OPTION_BY_KEY['선물/완구'],
    ],
  },
];

export const CALENDAR_EXCEL_BANKS = ['신한', '국민', '카카오뱅크', '하나', '우리'] as const;
