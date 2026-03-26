import { useCallback, useState } from 'react';

interface UseVerificationCodeInputOptions {
  codeLength: number;
  disabled?: boolean;
  clearAfterComplete?: boolean;
  onComplete?: (code: string) => void | Promise<unknown>;
}

export function useVerificationCodeInput({
  codeLength,
  disabled = false,
  clearAfterComplete = false,
  onComplete,
}: UseVerificationCodeInputOptions) {
  const [code, setCode] = useState('');

  const resetCode = useCallback(() => {
    setCode('');
  }, []);

  const handlePressNumber = useCallback(
    (value: string) => {
      if (disabled || code.length >= codeLength) {
        return;
      }

      const nextCode = code + value;
      setCode(nextCode);

      if (nextCode.length === codeLength && onComplete) {
        const completeResult = onComplete(nextCode);

        if (clearAfterComplete) {
          void Promise.resolve(completeResult).finally(() => {
            resetCode();
          });
        }
      }
    },
    [clearAfterComplete, code, codeLength, disabled, onComplete, resetCode],
  );

  const handlePressDelete = useCallback(() => {
    if (disabled || code.length === 0) {
      return;
    }

    setCode((prev) => prev.slice(0, -1));
  }, [code.length, disabled]);

  return {
    code,
    resetCode,
    handlePressNumber,
    handlePressDelete,
  };
}
