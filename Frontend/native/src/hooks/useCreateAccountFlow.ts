import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { checkUserId, signup, type NativeSignupRequest } from '../services/auth';
import type { RootNavigationProp } from '../types';
import type { CreateAccountRouteParams } from '../types/auth';
import { buildIdentityProfile } from '../utils/authIdentity';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { extractApiErrorMessage } from '../utils/error';
import { validateId, validateName, validatePhone } from '../utils/validation';

const DUPLICATE_CHECK_FAILED_MESSAGE = '아이디 중복 확인에 실패했어요.';
const DUPLICATE_ID_MESSAGE = '이미 사용 중인 아이디예요.';
const SIGNUP_FAILED_MESSAGE = '회원가입 처리 중 문제가 발생했어요.';
const USER_ID_REQUIRED_MESSAGE = '회원가입에 필요한 아이디 정보가 없어요. 다시 로그인해 주세요.';

interface CreateAccountSubmitParams {
  userId: string;
  password: string;
}

export function useCreateAccountFlow(routeParams: CreateAccountRouteParams) {
  const navigation = useNavigation<RootNavigationProp>();
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const clearSubmitError = useCallback(() => {
    setSubmitError('');
  }, []);

  const resetIdAvailability = useCallback(() => {
    setIsIdAvailable(null);
  }, []);

  const handleCheckId = useCallback(
    async (rawUserId: string) => {
      const trimmedId = rawUserId.trim();
      const idValidation = validateId(trimmedId);

      if (!idValidation.isValid) {
        setSubmitError(idValidation.message);
        setIsIdAvailable(false);
        return false;
      }

      if (isCheckingId || isSubmitting) {
        return false;
      }

      setIsCheckingId(true);
      setSubmitError('');

      try {
        const response = await checkUserId(trimmedId);
        const isAvailable = response?.isAvailable === true;

        setIsIdAvailable(isAvailable);

        if (!isAvailable) {
          setSubmitError(response?.message ?? DUPLICATE_ID_MESSAGE);
        }

        return isAvailable;
      } catch (error: any) {
        const message = extractApiErrorMessage(error, DUPLICATE_CHECK_FAILED_MESSAGE);
        setIsIdAvailable(false);
        setSubmitError(message);
        Alert.alert('중복 확인 실패', message);
        return false;
      } finally {
        setIsCheckingId(false);
      }
    },
    [isCheckingId, isSubmitting],
  );

  const handleCreateAccount = useCallback(
    async ({ userId, password }: CreateAccountSubmitParams) => {
      const trimmedUserId = userId.trim();

      if (!trimmedUserId) {
        setSubmitError(USER_ID_REQUIRED_MESSAGE);
        return false;
      }

      setIsSubmitting(true);
      setSubmitError('');

      const currentName = routeParams.name ?? '';
      const currentPhone = routeParams.phone ?? '';

      const nameValidation = validateName(currentName);
      if (!nameValidation.isValid) {
        setSubmitError(nameValidation.message);
        setIsSubmitting(false);
        return false;
      }

      const phoneValidation = validatePhone(currentPhone);
      if (!phoneValidation.isValid) {
        setSubmitError(phoneValidation.message);
        setIsSubmitting(false);
        return false;
      }

      const identityProfile = buildIdentityProfile(
        routeParams.ssnFront,
        routeParams.ssnBack,
      );

      const signupPayload: NativeSignupRequest = {
        userId: trimmedUserId,
        pw: password,
        name: currentName.trim(),
        gender: identityProfile?.gender ?? 'M',
        phoneNumber: currentPhone.replace(/[^0-9]/g, ''),
        birthDate: identityProfile?.birthDate ?? '2000-01-01',
        alarmEnabled: true,
        termsAgreed: routeParams.termsAgreed === true,
      };

      try {
        await signup(signupPayload);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Welcome',
                params: {
                  signupMode: 'normal',
                  name: signupPayload.name,
                  userId: trimmedUserId,
                  pw: signupPayload.pw,
                  birthDate: signupPayload.birthDate,
                  gender: signupPayload.gender,
                  phoneNumber: signupPayload.phoneNumber,
                  termsAgreed: signupPayload.termsAgreed,
                  alarmEnabled: signupPayload.alarmEnabled,
                },
              },
            ],
          }),
        );
        return true;
      } catch (error: any) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'signup',
          fallbackMessage: SIGNUP_FAILED_MESSAGE,
        });
        setSubmitError(presentation.inlineMessage);
        Alert.alert(presentation.title, presentation.alertMessage);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigation, routeParams],
  );

  return {
    isCheckingId,
    isIdAvailable,
    isSubmitting,
    submitError,
    clearSubmitError,
    resetIdAvailability,
    handleCheckId,
    handleCreateAccount,
  };
}
