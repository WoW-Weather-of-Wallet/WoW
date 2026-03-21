import type {
  CalendarDayDetail,
  CalendarDayItem,
  CalendarTransactionGroup,
  CalendarTransactionItem,
} from '../../mock/calendar';
import type { ManualCalendarEntryDraft } from '../../types/calendar';
import { CATEGORY_META, buildFallbackDetail, formatDateTitle } from './state';
import { DEFAULT_CALENDAR_CATEGORY } from './addEntry';

export interface ManualEntryPatch {
  itemsByDate: Map<string, CalendarTransactionItem[]>;
  amountByDate: Map<string, number>;
}

export function buildManualEntryPatch(entries: ManualCalendarEntryDraft[]): ManualEntryPatch {
  const itemsByDate = new Map<string, CalendarTransactionItem[]>();
  const amountByDate = new Map<string, number>();
  const timestamp = Date.now();

  entries.forEach((entry, index) => {
    const categoryMeta = CATEGORY_META[entry.category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];
    const transactionItem: CalendarTransactionItem = {
      id: `manual-${entry.dateKey}-${timestamp}-${index}`,
      title: entry.merchantName,
      category: entry.category,
      amount: entry.amount,
      // 백엔드 DTO에는 아직 결제수단 필드가 없어서,
      // 프론트 표시용으로만 직접 입력 구분을 time 문구에 함께 남깁니다.
      time: `직접 입력 · ${entry.paymentMethod === 'cash' ? '현금' : '카드'}`,
      icon: categoryMeta.icon,
      iconTone: categoryMeta.iconTone,
    };

    itemsByDate.set(entry.dateKey, [...(itemsByDate.get(entry.dateKey) ?? []), transactionItem]);
    amountByDate.set(entry.dateKey, (amountByDate.get(entry.dateKey) ?? 0) + entry.amount);
  });

  return {
    itemsByDate,
    amountByDate,
  };
}

export function mergeTransactionGroups(
  groups: CalendarTransactionGroup[],
  patch: ManualEntryPatch,
): CalendarTransactionGroup[] {
  const grouped = new Map(groups.map((group) => [group.id, group]));

  patch.itemsByDate.forEach((items, dateKey) => {
    const existingGroup = grouped.get(dateKey);
    const nextDailySpent =
      (existingGroup?.dailySpent ?? 0) + items.reduce((sum, item) => sum + item.amount, 0);

    grouped.set(dateKey, {
      id: dateKey,
      dateLabel: formatDateTitle(dateKey),
      dailySpent: nextDailySpent,
      items: [...items, ...(existingGroup?.items ?? [])],
    });
  });

  return Array.from(grouped.values()).sort((a, b) => (a.id < b.id ? 1 : -1));
}

export function mergeCalendarDaySource(
  days: CalendarDayItem[],
  patch: ManualEntryPatch,
): CalendarDayItem[] {
  const dayMap = new Map(days.map((day) => [day.dateKey, day]));

  patch.amountByDate.forEach((amount, dateKey) => {
    const existingDay = dayMap.get(dateKey);
    const [, , dayNumberRaw] = dateKey.split('-');
    const dayNumber = Number(dayNumberRaw);

    if (existingDay) {
      dayMap.set(dateKey, {
        ...existingDay,
        amount: (existingDay.amount ?? 0) + amount,
        isFuture: false,
      });
      return;
    }

    dayMap.set(dateKey, {
      dateKey,
      dayNumber,
      amount,
      tone: 'primary',
      weatherTone: 'cloudy',
      isCurrentMonth: true,
      isFuture: false,
    });
  });

  return Array.from(dayMap.values());
}

export function mergeCalendarDayDetails(
  details: Record<string, CalendarDayDetail>,
  patch: ManualEntryPatch,
): Record<string, CalendarDayDetail> {
  const nextDetails = { ...details };

  patch.itemsByDate.forEach((items, dateKey) => {
    const existingDetail = nextDetails[dateKey] ?? buildFallbackDetail(dateKey);
    nextDetails[dateKey] = {
      ...existingDetail,
      title: formatDateTitle(dateKey),
      spentAmount:
        (existingDetail.spentAmount ?? 0) + items.reduce((sum, item) => sum + item.amount, 0),
      transactionCount: (existingDetail.transactionCount ?? 0) + items.length,
      items: [...items, ...existingDetail.items],
    };
  });

  return nextDetails;
}
