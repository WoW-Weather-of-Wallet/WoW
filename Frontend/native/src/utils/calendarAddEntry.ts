import type {
  CalendarOverrideRow,
  CalendarUploadBackendItem,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
  CalendarUploadPreviewItem,
} from '../types/calendar';

function normalizeMerchantName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\(주\)|㈜|주식회사/g, '')
    .replace(/[\s\-_/().,·]/g, '');
}

function findMatchedBackendItem(
  backendItems: CalendarUploadBackendItem[],
  dateKey: string,
  merchantName: string,
  amount: number,
) {
  const exactMatch = backendItems.find(
    (item) =>
      item.transactionDate === dateKey &&
      item.merchantName === merchantName &&
      item.amount === amount,
  );
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedMerchantName = normalizeMerchantName(merchantName);
  const normalizedMatch = backendItems.find(
    (item) =>
      item.transactionDate === dateKey &&
      normalizeMerchantName(item.merchantName) === normalizedMerchantName &&
      item.amount === amount,
  );
  if (normalizedMatch) {
    return normalizedMatch;
  }

  const sameDateAndAmount = backendItems.filter(
    (item) => item.transactionDate === dateKey && item.amount === amount,
  );
  if (sameDateAndAmount.length === 1) {
    return sameDateAndAmount[0];
  }

  return undefined;
}

export function mergeUploadGroupsWithBackendItems(
  groups: CalendarUploadPreviewGroup[],
  backendItems: CalendarUploadBackendItem[],
) {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const matchedBackendItem = findMatchedBackendItem(
        backendItems,
        group.dateKey,
        item.merchantName,
        item.amount,
      );

      if (!matchedBackendItem) {
        return item;
      }

      const nextCategoryLabel =
        matchedBackendItem.category && matchedBackendItem.category.trim().length > 0
          ? matchedBackendItem.category
          : item.categoryLabel;
      const nextStatus =
        matchedBackendItem.status ??
        (matchedBackendItem.category && matchedBackendItem.category.trim().length > 0
          ? 'classified'
          : item.status);

      return {
        ...item,
        categoryLabel: nextCategoryLabel,
        categoryId: matchedBackendItem.categoryId ?? item.categoryId,
        status: nextStatus,
        description:
          matchedBackendItem.transactionDetail ||
          matchedBackendItem.classificationReason ||
          item.description,
      };
    }),
  }));
}

export function buildUploadGroupsFromBackendItems(
  backendItems: CalendarUploadBackendItem[],
): CalendarUploadPreviewGroup[] {
  const grouped = new Map<string, CalendarUploadPreviewItem[]>();

  backendItems.forEach((item, index) => {
    if (!item.transactionDate) {
      return;
    }

    const categoryLabel =
      item.status === 'needs-category'
        ? '분류필요'
        : item.category && item.category.trim().length > 0
          ? item.category
          : '분류필요';

    const nextItem: CalendarUploadPreviewItem = {
      id: `backend-${item.transactionDate}-${index}`,
      merchantName: item.merchantName,
      amount: item.amount,
      categoryLabel,
      status: item.status,
      description: item.transactionDetail || item.classificationReason || undefined,
      categoryId: item.categoryId,
    };

    grouped.set(item.transactionDate, [...(grouped.get(item.transactionDate) ?? []), nextItem]);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, items]) => ({
      dateKey,
      totalCount: items.length,
      items,
    }));
}

export function buildOverrideRows(
  groups: CalendarUploadPreviewGroup[],
  backendItems: CalendarUploadBackendItem[],
): CalendarOverrideRow[] {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => {
      const matchedBackendItem = findMatchedBackendItem(
        backendItems,
        group.dateKey,
        item.merchantName,
        item.amount,
      );

      if (!matchedBackendItem || matchedBackendItem.status !== 'needs-category') {
        return [];
      }

      return [
        {
          merchant_name: item.merchantName,
          category: String(item.categoryLabel),
          reason:
            matchedBackendItem.classificationReason ||
            matchedBackendItem.transactionDetail ||
            '프론트에서 직접 분류한 항목입니다.',
        },
      ];
    }),
  );
}

export function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function buildFileSummary(file: CalendarUploadFile) {
  if (!file.size) {
    return file.mimeType ?? '파일 정보 없음';
  }

  const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
  return `${fileSizeKb}KB${file.mimeType ? ` · ${file.mimeType}` : ''}`;
}

export function buildUploadRequest(file: CalendarUploadFile) {
  const lowerName = file.name.toLowerCase();
  const isUploadCsvFile = lowerName.endsWith('.csv');
  const isCardFile = isUploadCsvFile || lowerName.includes('card') || lowerName.includes('카드');

  return {
    bankFile: isCardFile ? null : file,
    cardFile: isCardFile ? file : null,
  };
}
