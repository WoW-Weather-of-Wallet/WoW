import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { useCreateAccountFlow } from './useCreateAccountFlow';
import { usePasswordPairForm } from './usePasswordPairForm';
import type { CreateAccountRouteParams } from '../types/auth';

type CreateAccountStep = 1 | 2 | 3;

interface ButtonState {
  text: string;
  isActive: boolean;
  onPress?: () => void;
}

export function useCreateAccountStepFlow(routeParams: CreateAccountRouteParams) {
  const [step, setStep] = useState<CreateAccountStep>(1);
  const [id, setId] = useState('');
  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  const {
    isCheckingId,
    isIdAvailable,
    isSubmitting,
    submitError,
    clearSubmitError,
    resetIdAvailability,
    handleCheckId: submitIdCheck,
    handleCreateAccount: submitCreateAccount,
  } = useCreateAccountFlow(routeParams);

  const {
    password,
    confirmPassword,
    isPasswordVisible,
    isConfirmPasswordVisible,
    passwordValidation,
    isPasswordValid,
    isPasswordMatch,
    canShowMismatch,
    isFormValid: isPasswordFormValid,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = usePasswordPairForm({
    identifier: id,
  });

  const hasSignupIdentifier = Boolean(isIdAvailable);
  const isFormValid = hasSignupIdentifier && isPasswordFormValid && !isSubmitting;

  const handleCheckId = useCallback(async () => {
    const isAvailable = await submitIdCheck(id);

    if (!isAvailable) {
      return;
    }

    setTimeout(() => {
      setStep((prev) => (prev < 2 ? 2 : prev));
      pwRef.current?.focus();
    }, 250);
  }, [id, submitIdCheck]);

  const handleNextStep = useCallback(() => {
    if (!isPasswordValid) {
      return;
    }

    setStep(3);
    setTimeout(() => confirmPwRef.current?.focus(), 150);
  }, [isPasswordValid]);

  const handleCreateAccount = useCallback(async () => {
    if (!isFormValid) {
      return;
    }

    await submitCreateAccount({
      userId: id,
      password,
    });
  }, [id, isFormValid, password, submitCreateAccount]);

  const handleIdChange = useCallback(
    (text: string) => {
      setId(text);
      clearSubmitError();

      if (isIdAvailable !== null) {
        resetIdAvailability();
      }
    },
    [clearSubmitError, isIdAvailable, resetIdAvailability],
  );

  const title = useMemo(() => {
    if (step === 1) {
      return '회원가입 아이디를\n입력해 주세요.';
    }

    if (step === 2) {
      return '비밀번호를\n입력해 주세요.';
    }

    return '비밀번호를\n한 번 더 입력해 주세요.';
  }, [step]);

  const buttonState = useMemo<ButtonState>(() => {
    if (step === 1) {
      return {
        text: '다음',
        isActive: false,
      };
    }

    if (step === 2) {
      return {
        text: '다음',
        isActive: isPasswordValid,
        onPress: handleNextStep,
      };
    }

    return {
      text: isSubmitting ? '회원가입 중...' : '계정 생성하기',
      isActive: isFormValid,
      onPress: handleCreateAccount,
    };
  }, [handleCreateAccount, handleNextStep, isFormValid, isPasswordValid, isSubmitting, step]);

  return {
    step,
    id,
    password,
    confirmPassword,
    isCheckingId,
    isIdAvailable,
    isSubmitting,
    isPasswordVisible,
    isConfirmPasswordVisible,
    submitError,
    passwordValidation,
    isPasswordValid,
    isPasswordMatch,
    canShowMismatch,
    title,
    stepIndicatorCurrentStep: step === 1 ? 3 : 4,
    buttonState,
    idRef,
    pwRef,
    confirmPwRef,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleCheckId,
    handleNextStep,
    handleCreateAccount,
    handleIdChange,
  };
}
