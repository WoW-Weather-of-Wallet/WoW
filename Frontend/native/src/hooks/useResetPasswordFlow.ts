import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { findPassword } from '../services/auth';
import type { RootNavigationProp, RootRouteProp } from '../types';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { buildIdentityProfile } from '../utils/authIdentity';
import { usePasswordPairForm } from './usePasswordPairForm';

const INVALID_IDENTITY_MESSAGE = '본인확인 정보가 올바르지 않아요.';
const RESET_SUCCESS_TITLE = '비밀번호 재설정 완료';
const RESET_SUCCESS_MESSAGE = '새 비밀번호로 다시 로그인해 주세요.';
const RESET_FAILED_MESSAGE =
  '비밀번호 재설정 중 문제가 발생했어요. 다시 시도해 주세요.';
const MISMATCH_MESSAGE = '* 비밀번호가 일치하지 않아요.';

export function useResetPasswordFlow() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<'ResetPassword'>>();
  const routeParams = route.params ?? {};
  const { userId, name, ssnFront, ssnBack, phoneNumber } = routeParams;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    password,
    confirmPassword,
    passwordValidation,
    isPasswordValid,
    canShowMismatch,
    isFormValid,
    setPassword,
    setConfirmPassword,
  } = usePasswordPairForm({
    identifier: userId,
  });

  const showPasswordError = password.length > 0 && !isPasswordValid;
  const showMismatchError = canShowMismatch && password !== confirmPassword;
  const isResetDisabled = !isFormValid || isSubmitting;

  const passwordErrorMessage = useMemo(() => {
    if (!showPasswordError) {
      return '';
    }

    return `* ${passwordValidation.message}`;
  }, [passwordValidation.message, showPasswordError]);

  const handleReset = useCallback(async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const identityProfile = buildIdentityProfile(ssnFront, ssnBack);

      if (!identityProfile || !name || !phoneNumber || !userId) {
        throw new Error(INVALID_IDENTITY_MESSAGE);
      }

      await findPassword({
        userId,
        name,
        birthDate: identityProfile.birthDate,
        gender: identityProfile.gender,
        phoneNumber,
        newPw: password,
      });

      Alert.alert(RESET_SUCCESS_TITLE, RESET_SUCCESS_MESSAGE, [
        {
          text: '확인',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'password-reset',
        fallbackMessage: RESET_FAILED_MESSAGE,
      });

      Alert.alert(presentation.title, presentation.alertMessage);
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    isSubmitting,
    name,
    navigation,
    password,
    phoneNumber,
    ssnBack,
    ssnFront,
    userId,
  ]);

  return {
    password,
    confirmPassword,
    isSubmitting,
    showPasswordError,
    showMismatchError,
    isResetDisabled,
    passwordErrorMessage,
    mismatchErrorMessage: MISMATCH_MESSAGE,
    setPassword,
    setConfirmPassword,
    handleReset,
  };
}
