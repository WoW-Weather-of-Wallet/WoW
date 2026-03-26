import { COLORS } from '../constants/theme';

export function getFixedExpenseIconColor(iconTone: string) {
  return iconTone === '#111111' ? COLORS.white : COLORS.textPrimary;
}

export function getFixedExpenseEnabledLabel(isEnabled: boolean) {
  return isEnabled ? '활성' : '비활성';
}

export function stripFixedExpenseCategorySuffix(subtitle: string, category?: string) {
  if (!category) {
    return subtitle.replace(
      /\s(인터넷쇼핑|인테리어\/가정용품|교통서비스|음\/식료품소매|외식|제과\/제빵\/떡\/케익|커피\/음료|패스트푸드|자동차\/유지비|시스템\/통신|건강\/기호식품|분식|육류\/회식|선물\/완구|병원\/의료|화장품소매|공연관람|의약\/의료품|건강\/뷰티\/마사지|수리서비스)$/,
      '',
    ).trim();
  }

  return subtitle.replace(new RegExp(`\\s*${category}$`), '').trim();
}
