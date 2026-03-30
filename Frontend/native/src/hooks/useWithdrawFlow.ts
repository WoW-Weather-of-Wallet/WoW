import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import {
  TELECOM_PLACEHOLDER,
} from '../constants/auth/identityVerification';
import { deleteAccount, normalizePhoneNumber } from '../services/auth';
import { clearPersistedAuthSession } from '../services/sessionStorage';
import { useAuthStore } from '../store/authStore';
import { fcmService } from '../services/fcmService';
import { extractApiErrorMessage } from '../utils/error';
import {
  buildIdentityBackFromProfile,
  buildIdentityFrontFromBirthDate,
} from '../utils/profileIdentity';
import { validateName, validatePhone } from '../utils/validation';
import type { MyPageStackScreenProps } from '../types';
import { useSmsVerification } from './useSmsVerification';

interface UseWithdrawFlowOptions {
  navigation: MyPageStackScreenProps<'Withdraw'>['navigation'];
  rawPhone: string;
  profileName: string;
  profileBirthDate: string;
  profileGender: string;
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, '');

export function useWithdrawFlow({
  navigation,
  rawPhone,
  profileName,
  profileBirthDate,
  profileGender,
}: UseWithdrawFlowOptions) {
  const logout = useAuthStore((state) => state.logout);
  const expectedSsnFront = useMemo(
    () => buildIdentityFrontFromBirthDate(profileBirthDate),
    [profileBirthDate],
  );
  const expectedSsnBack = useMemo(
    () => buildIdentityBackFromProfile(profileGender, profileBirthDate),
    [profileBirthDate, profileGender],
  );

  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [isTelecomModalVisible, setIsTelecomModalVisible] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const smsVerification = useSmsVerification({
    sendFallbackMessage:
      '인증번호를 보내지 못했어요. 잠시 후 다시 시도해주세요.',
    resendFallbackMessage:
      '인증번호 재전송에 실패했어요. 잠시 후 다시 시도해주세요.',
    verifyFallbackMessage:
      '인증번호 확인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  });

  const validateAgainstProfile = useCallback(() => {
    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    const nameValidation = validateName(name);

    if (!nameValidation.isValid) {
      return nameValidation.message;
    }

    const phoneValidation = validatePhone(normalizedPhoneNumber);
    if (!phoneValidation.isValid) {
      return phoneValidation.message;
    }

    if (ssnFront.length !== 6) {
      return '주민등록번호 앞자리를 6자리로 입력해주세요.';
    }

    if (ssnBack.length !== 1) {
      return '주민등록번호 뒷자리 첫 번째 숫자를 입력해주세요.';
    }

    if (telecom === TELECOM_PLACEHOLDER) {
      return '통신사를 선택해주세요.';
    }

    if (normalizeName(name) !== normalizeName(profileName)) {
      return '입력한 이름이 회원 정보와 일치하지 않아요.';
    }

    if (ssnFront !== expectedSsnFront || ssnBack !== expectedSsnBack) {
      return '입력한 주민등록번호가 회원 정보와 일치하지 않아요.';
    }

    if (normalizedPhoneNumber !== normalizePhoneNumber(rawPhone)) {
      return '입력한 휴대폰 번호가 회원 정보와 일치하지 않아요.';
    }

    return null;
  }, [
    expectedSsnBack,
    expectedSsnFront,
    name,
    phone,
    profileName,
    rawPhone,
    ssnBack,
    ssnFront,
    telecom,
  ]);

  const handleSelectTelecom = useCallback((value: string) => {
    setTelecom(value);
    setIsTelecomModalVisible(false);
    setSubmitError('');
  }, []);

  const handleSendCode = useCallback(async () => {
    if (smsVerification.isSending || !rawPhone) {
      return;
    }

    const validationMessage = validateAgainstProfile();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    setSubmitError('');
    await smsVerification.startVerification(normalizedPhoneNumber);
  }, [phone, rawPhone, smsVerification, validateAgainstProfile]);

  const handleWithdraw = useCallback(async () => {
    if (!smsVerification.isVerified || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      try {
        await fcmService.unregisterFcmToken();
      } catch (fcmError) {
        console.warn('[Withdraw] FCM 토큰 제거 실패:', fcmError);
      }

      await deleteAccount();
      await clearPersistedAuthSession();
      logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '회원 탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      );
      Alert.alert('회원 탈퇴 오류', message);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, logout, navigation, smsVerification.isVerified]);

  const isButtonActive =
    name.trim().length >= 2 &&
    ssnFront.length === 6 &&
    ssnBack.length === 1 &&
    telecom !== TELECOM_PLACEHOLDER &&
    phone.length >= 10 &&
    !smsVerification.isSending;

  return {
    expectedSsnFront,
    expectedSsnBack,
    name,
    ssnFront,
    ssnBack,
    telecom,
    phone,
    isTelecomModalVisible,
    submitError,
    isDeleting,
    isButtonActive,
    setName,
    setSsnFront,
    setSsnBack,
    setPhone,
    setSubmitError,
    setIsTelecomModalVisible,
    handleSelectTelecom,
    handleSendCode,
    handleWithdraw,
    ...smsVerification,
  };
}
