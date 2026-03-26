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

  const sheetTitle = isEditMode
    ? '\uACE0\uC815\uC9C0\uCD9C \uC218\uC815'
    : '\uACE0\uC815\uC9C0\uCD9C \uB4F1\uB85D';

  const sheetSubtitle = useMemo(() => {
    if (!item) {
      return '';
    }

    if (isEditMode) {
      return `"${item.title}" \uD56D\uBAA9\uC758 \uAE08\uC561\uACFC \uB0A9\uBD80\uC77C\uC744 \uD544\uC694\uC5D0 \uB9DE\uAC8C \uC218\uC815\uD574\uBCF4\uC138\uC694.`;
    }

    return `"${item.title}"\uB97C \uACE0\uC815\uC9C0\uCD9C\uB85C \uB4F1\uB85D\uD558\uACE0 \uC6D4\uBCC4 \uD750\uB984\uC5D0 \uBC18\uC601\uD574\uBCF4\uC138\uC694.`;
  }, [isEditMode, item]);

  const aiHintTitle = isEditMode
    ? '\uD56D\uBAA9 \uC218\uC815 \uC548\uB0B4'
    : '\uCE74\uD14C\uACE0\uB9AC \uC81C\uC548 \uC548\uB0B4';

  const aiHintText = useMemo(() => {
    if (isEditMode) {
      return '\uC218\uC815 \uD6C4\uC5D0\uB294 \uAE08\uC561\uACFC \uB0A9\uBD80\uC77C\uC774 \uBC14\uB85C \uC801\uC6A9\uB418\uBA70, \uC6D4\uBCC4 \uACE0\uC815\uC9C0\uCD9C \uD750\uB984\uC5D0\uB3C4 \uD568\uAED8 \uBC18\uC601\uB429\uB2C8\uB2E4.';
    }

    return `\uB4F1\uB85D \uC804\uC5D0 \uCE74\uD14C\uACE0\uB9AC\uC640 \uB0A9\uBD80\uC77C\uC744 \uD55C \uBC88 \uB354 \uD655\uC778\uD574\uBCF4\uC138\uC694. \uD604\uC7AC \uC81C\uC548 \uCE74\uD14C\uACE0\uB9AC\uB294 "${resolvedCategory}"\uC785\uB2C8\uB2E4.`;
  }, [isEditMode, resolvedCategory]);

  const amountPreviewLabel = `${Number(amountInput || 0).toLocaleString()}`;

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
