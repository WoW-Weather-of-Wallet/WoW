import { useEffect, useMemo, useState } from 'react';
import {
  type CalendarEntryCategoryKey,
} from '../constants/calendar/addEntry';
import type {
  CalendarUploadFile,
  ManualCalendarEntryDraft,
  ManualEntryPaymentMethod,
} from '../types/calendar';

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
  const [selectedCategory, setSelectedCategory] = useState<CalendarEntryCategoryKey | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<ManualEntryPaymentMethod | null>(null);
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
    setSelectedCategory(null);
    setSelectedPaymentMethod(null);
    setMerchantName('');
    setAmountInput('');
    setDraftEntries([]);
    setSelectedExcelFile(null);
  }, [defaultDateKey, visible]);

  const isAddEnabled = useMemo(() => {
    return (
      dateKey.trim().length > 0 &&
      merchantName.trim().length > 0 &&
      Number(amountInput) > 0 &&
      selectedCategory !== null &&
      selectedPaymentMethod !== null
    );
  }, [amountInput, dateKey, merchantName, selectedCategory, selectedPaymentMethod]);

  const addDraftEntry = () => {
    if (!isAddEnabled || selectedCategory === null || selectedPaymentMethod === null) {
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
        paymentMethod: selectedPaymentMethod,
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
    selectedPaymentMethod,
    merchantName,
    amountInput,
    draftEntries,
    selectedExcelFile,
    isAddEnabled,
    setActiveMode,
    setDateKey,
    setSelectedCategory,
    setSelectedPaymentMethod,
    setMerchantName,
    setAmountInput,
    setSelectedExcelFile,
    addDraftEntry,
    removeDraftEntry,
  };
}
