import { useEffect, useMemo, useState } from 'react';

export interface FixedExpenseDetailItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

interface UseFixedExpenseDetailFormParams {
  visible: boolean;
  item: FixedExpenseDetailItem | null;
  mode?: 'create' | 'edit';
  initialCategory?: string;
  initialPaymentDay?: number;
  onSubmit: (payload: { category: string; paymentDay: number; amount: number }) => void;
}

export function useFixedExpenseDetailForm({
  visible,
  item,
  mode = 'create',
  initialCategory,
  initialPaymentDay,
  onSubmit,
}: UseFixedExpenseDetailFormParams) {
  const [paymentDay, setPaymentDay] = useState(11);
  const [amountInput, setAmountInput] = useState('');

  const isEditMode = mode === 'edit';
  const resolvedCategory = initialCategory ?? item?.category ?? '';

  useEffect(() => {
    if (!visible || !item) {
      return;
    }

    setPaymentDay(initialPaymentDay ?? 11);
    setAmountInput(String(item.amount));
  }, [initialPaymentDay, item, visible]);

  const sheetTitle = isEditMode ? '고정지출 수정' : '등록 설정';

  const sheetSubtitle = useMemo(() => {
    if (!item) {
      return '';
    }

    if (isEditMode) {
      return `"${item.title}" 항목의 금액과 납부일을 변경할 수 있어요`;
    }

    return `"${item.title}"를 고정지출로 연결하는 단계입니다`;
  }, [isEditMode, item]);

  const aiHintTitle = isEditMode
    ? '현재 항목 정보는 그대로 유지돼요'
    : '카테고리는 상세 조회에서만 확인';

  const aiHintText = useMemo(() => {
    if (isEditMode) {
      return '수정 화면에서는 금액과 납부일을 바꿀 수 있고, 거래명과 카테고리는 현재 설정을 유지합니다.';
    }

    return `등록 단계에서는 카테고리를 고르지 않고, 현재 거래 기준 분류를 그대로 유지합니다. 현재 분류는 "${resolvedCategory}"로 연결됩니다.`;
  }, [isEditMode, resolvedCategory]);

  const amountPreviewLabel = `₩${Number(amountInput || 0).toLocaleString()}`;

  const handleChangeAmountInput = (text: string) => {
    setAmountInput(text.replace(/[^0-9]/g, ''));
  };

  const decreasePaymentDay = () => {
    setPaymentDay((current) => Math.max(1, current - 1));
  };

  const increasePaymentDay = () => {
    setPaymentDay((current) => Math.min(31, current + 1));
  };

  const handleSubmit = () => {
    if (!item) {
      return;
    }

    onSubmit({
      category: resolvedCategory,
      paymentDay,
      amount: isEditMode ? Number(amountInput || item.amount) : item.amount,
    });
  };

  return {
    isEditMode,
    resolvedCategory,
    paymentDay,
    amountInput,
    sheetTitle,
    sheetSubtitle,
    aiHintTitle,
    aiHintText,
    amountPreviewLabel,
    handleChangeAmountInput,
    decreasePaymentDay,
    increasePaymentDay,
    handleSubmit,
  };
}
