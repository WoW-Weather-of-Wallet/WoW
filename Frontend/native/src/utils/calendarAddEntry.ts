import type {
  CalendarOverrideRow,
  CalendarUploadBackendItem,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
} from '../types/calendar';

export function mergeUploadGroupsWithBackendItems(
  groups: CalendarUploadPreviewGroup[],
  backendItems: CalendarUploadBackendItem[],
) {
  const backendItemByKey = new Map<string, CalendarUploadBackendItem>();

  backendItems.forEach((item) => {
    if (!item.transactionDate) {
      return;
    }

    const lookupKey = `${item.transactionDate}::${item.merchantName}::${item.amount}`;
    backendItemByKey.set(lookupKey, item);
  });

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const lookupKey = `${group.dateKey}::${item.merchantName}::${item.amount}`;
      const matchedBackendItem = backendItemByKey.get(lookupKey);

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

export function buildOverrideRows(
  groups: CalendarUploadPreviewGroup[],
  backendItems: CalendarUploadBackendItem[],
): CalendarOverrideRow[] {
  const backendItemByKey = new Map<string, CalendarUploadBackendItem>();

  backendItems.forEach((item) => {
    if (!item.transactionDate) {
      return;
    }

    backendItemByKey.set(`${item.transactionDate}::${item.merchantName}::${item.amount}`, item);
  });

  return groups.flatMap((group) =>
    group.items.flatMap((item) => {
      const lookupKey = `${group.dateKey}::${item.merchantName}::${item.amount}`;
      const matchedBackendItem = backendItemByKey.get(lookupKey);

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
