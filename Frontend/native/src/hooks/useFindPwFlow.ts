import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRecoverySmsFlow } from './useRecoverySmsFlow';
import type { RootRouteProp } from '../types';
import { validateId } from '../utils/validation';

const INVALID_ID_TITLE = '오류';
const ID_HELPER_TEXT = '* 영문 또는 숫자 조합 4~20자로 입력해 주세요.';
const BEFORE_VERIFICATION_DESCRIPTION =
  '가입한 아이디를 확인한 뒤 본인인증을 진행할게요.';
const AFTER_VERIFICATION_DESCRIPTION =
  '본인 확인이 완료되면 새로운 비밀번호를 설정할 수 있어요.';

export function useFindPwFlow() {
  const route = useRoute<RootRouteProp<'FindPw'>>();
  const routeParams = route.params ?? {};
  const [userId, setUserId] = useState(routeParams.prefilledId ?? '');
  const [showVerification, setShowVerification] = useState(false);

  const trimmedUserId = userId.trim();
  const isNextEnabled =
    trimmedUserId.length >= 4 && trimmedUserId.length <= 20;

  const {
    isSubmitting,
    termsVisible,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  } = useRecoverySmsFlow({
    flow: 'FindPw',
    fallbackMessage: '인증번호 발송에 실패했어요. 잠시 후 다시 시도해 주세요.',
    buildParams: useCallback(
      () => ({
        userId: trimmedUserId,
      }),
      [trimmedUserId],
    ),
  });

  useEffect(() => {
    if (routeParams.prefilledId) {
      setUserId(routeParams.prefilledId);
    }
  }, [routeParams.prefilledId]);

  const handleIdSubmit = useCallback(() => {
    const validation = validateId(trimmedUserId);

    if (validation.isValid) {
      setShowVerification(true);
      return;
    }

    Alert.alert(INVALID_ID_TITLE, validation.message);
  }, [trimmedUserId]);

  const handleUserIdChange = useCallback((text: string) => {
    setUserId(text.replace(/[^a-zA-Z0-9]/g, ''));
  }, []);

  const introDescription = useMemo(
    () =>
      showVerification
        ? AFTER_VERIFICATION_DESCRIPTION
        : BEFORE_VERIFICATION_DESCRIPTION,
    [showVerification],
  );

  return {
    userId,
    showVerification,
    isSubmitting,
    termsVisible,
    isNextEnabled,
    introDescription,
    helperText: ID_HELPER_TEXT,
    handleUserIdChange,
    handleIdSubmit,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  };
}
