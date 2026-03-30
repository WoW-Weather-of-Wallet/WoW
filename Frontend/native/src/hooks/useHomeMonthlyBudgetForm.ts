import React from 'react';

interface UseHomeMonthlyBudgetFormParams {
  visible: boolean;
  isCreatingBudget?: boolean;
  onCreateBudget?: (amount: number) => Promise<void> | void;
}

export function useHomeMonthlyBudgetForm({
  visible,
  isCreatingBudget = false,
  onCreateBudget,
}: UseHomeMonthlyBudgetFormParams) {
  const [budgetAmount, setBudgetAmount] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setBudgetAmount('');
    }
  }, [visible]);

  const parsedBudgetAmount = React.useMemo(
    () => Number(budgetAmount.replace(/[^0-9]/g, '')),
    [budgetAmount],
  );
  const isBudgetAmountValid =
    Number.isFinite(parsedBudgetAmount) && parsedBudgetAmount > 0;

  const handleBudgetAmountChange = React.useCallback((text: string) => {
    setBudgetAmount(text.replace(/[^0-9]/g, ''));
  }, []);

  const handleCreateBudget = React.useCallback(async () => {
    if (!onCreateBudget || !isBudgetAmountValid || isCreatingBudget) {
      return;
    }

    await onCreateBudget(parsedBudgetAmount);
    setBudgetAmount('');
  }, [isBudgetAmountValid, isCreatingBudget, onCreateBudget, parsedBudgetAmount]);

  return {
    budgetAmount,
    isBudgetAmountValid,
    handleBudgetAmountChange,
    handleCreateBudget,
  };
}
