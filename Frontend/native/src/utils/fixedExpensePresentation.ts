import { COLORS } from '../constants/theme';

export function getFixedExpenseIconColor(iconTone: string) {
  return iconTone === '#111111' ? COLORS.white : COLORS.textPrimary;
}

export function getFixedExpenseEnabledLabel(isEnabled: boolean) {
  return isEnabled ? '\uC0AC\uC6A9 \uC911' : '\uBE44\uD65C\uC131';
}

export function stripFixedExpenseCategorySuffix(
  subtitle: string,
  category?: string,
) {
  const normalizedSubtitle = subtitle.trim();

  if (!category) {
    return normalizedSubtitle;
  }

  return normalizedSubtitle.replace(new RegExp(`\\s*${category}$`), '').trim();
}
