import { useMemo, useState } from 'react';
import type { SelectableTransactionItem } from '../components/calendar/FixedExpensePickerRow';

export function useFixedExpensePickerSearch(items: SelectableTransactionItem[]) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const target = `${item.title} ${item.category} ${item.dateLabel}`.toLowerCase();
      return target.includes(normalizedQuery);
    });
  }, [items, query]);

  return {
    query,
    setQuery,
    filteredItems,
    hasQuery: query.trim().length > 0,
  };
}
