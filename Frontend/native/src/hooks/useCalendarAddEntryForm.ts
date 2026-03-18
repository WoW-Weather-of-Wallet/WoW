import { useEffect, useMemo, useState } from 'react';
import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';
import type { CalendarUploadFile, ManualCalendarEntryDraft } from '../types/calendar';

type EntryMode = 'direct' | 'excel';

interface UseCalendarAddEntryFormParams {
  defaultDateKey: string;
  visible: boolean;
}

export function useCalendarAddEntryForm({
  defaultDateKey,
  visible,
}: UseCalendarAddEntryFormParams) {
  const [activeMode, setActiveMode] = useState<EntryMode>('direct');
  const [dateKey, setDateKey] = useState(defaultDateKey);
  const [selectedCategory, setSelectedCategory] = useState<CalendarEntryCategoryKey>('식비');
  const [merchantName, setMerchantName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [draftEntries, setDraftEntries] = useState<ManualCalendarEntryDraft[]>([]);
  const [selectedExcelFile, setSelectedExcelFile] = useState<CalendarUploadFile | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveMode('direct');
    setDateKey(defaultDateKey);
    setSelectedCategory('식비');
    setMerchantName('');
    setAmountInput('');
    setDraftEntries([]);
    setSelectedExcelFile(null);
  }, [defaultDateKey, visible]);

  const isAddEnabled = useMemo(() => {
    return dateKey.trim().length > 0 && merchantName.trim().length > 0 && Number(amountInput) > 0;
  }, [amountInput, dateKey, merchantName]);

  const addDraftEntry = () => {
    if (!isAddEnabled) {
      return;
    }

    setDraftEntries((current) => [
      ...current,
      {
        id: `draft-${Date.now()}-${current.length}`,
        dateKey,
        merchantName: merchantName.trim(),
        category: selectedCategory,
        amount: Number(amountInput),
      },
    ]);
    setMerchantName('');
    setAmountInput('');
  };

  const removeDraftEntry = (draftId: string) => {
    setDraftEntries((current) => current.filter((draft) => draft.id !== draftId));
  };

  return {
    activeMode,
    dateKey,
    selectedCategory,
    merchantName,
    amountInput,
    draftEntries,
    selectedExcelFile,
    isAddEnabled,
    setActiveMode,
    setDateKey,
    setSelectedCategory,
    setMerchantName,
    setAmountInput,
    setSelectedExcelFile,
    addDraftEntry,
    removeDraftEntry,
  };
}
