import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  TELECOM_PLACEHOLDER,
} from '../constants/auth/identityVerification';
import { normalizePhoneNumber, updatePhone } from '../services/auth';
import { extractApiErrorMessage } from '../utils/error';
import {
  buildIdentityBackFromProfile,
  buildIdentityFrontFromBirthDate,
} from '../utils/profileIdentity';
import { validatePhone } from '../utils/validation';
import type { MyPageStackScreenProps } from '../types';
import { useSmsVerification } from './useSmsVerification';

interface UsePhoneUpdateFlowOptions {
  navigation: MyPageStackScreenProps<'PhoneUpdate'>['navigation'];
  rawPhone: string;
  profileBirthDate: string;
  profileGender: string;
}

export function usePhoneUpdateFlow({
  navigation,
  rawPhone,
  profileBirthDate,
  profileGender,
}: UsePhoneUpdateFlowOptions) {
  const expectedSsnFront = useMemo(
    () => buildIdentityFrontFromBirthDate(profileBirthDate),
    [profileBirthDate],
  );
  const expectedSsnBack = useMemo(
    () => buildIdentityBackFromProfile(profileGender, profileBirthDate),
    [profileBirthDate, profileGender],
  );

  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isTelecomModalVisible, setIsTelecomModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const smsVerification = useSmsVerification({
    sendFallbackMessage:
      '인증번호를 보내지 못했어요. 잠시 후 다시 시도해주세요.',
    resendFallbackMessage:
      '인증번호 재전송에 실패했어요. 잠시 후 다시 시도해주세요.',
    verifyFallbackMessage:
      '인증번호 확인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  });

  const validateForm = useCallback(() => {
    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    const phoneValidation = validatePhone(normalizedPhoneNumber);

    if (telecom === TELECOM_PLACEHOLDER) {
      return '통신사를 선택해주세요.';
    }

    if (!phoneValidation.isValid) {
      return phoneValidation.message;
    }

    if (normalizedPhoneNumber === normalizePhoneNumber(rawPhone)) {
      return '현재 번호와 다른 휴대폰 번호를 입력해주세요.';
    }

    return null;
  }, [phone, rawPhone, telecom]);

  const handleSelectTelecom = useCallback((value: string) => {
    setTelecom(value);
    setIsTelecomModalVisible(false);
    setSubmitError('');
  }, []);

  const handleSendCode = useCallback(async () => {
    if (smsVerification.isSending) {
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    setSubmitError('');
    await smsVerification.startVerification(normalizedPhoneNumber);
  }, [phone, smsVerification, validateForm]);

  const handleUpdatePhone = useCallback(async () => {
    if (!smsVerification.isVerified || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await updatePhone({ phoneNumber: smsVerification.requestedPhoneNumber });
      Alert.alert('변경 완료', '휴대폰 번호가 정상적으로 변경되었어요.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '휴대폰 번호 변경 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      );
      Alert.alert('휴대폰 번호 변경 오류', message);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, navigation, smsVerification.isVerified, smsVerification.requestedPhoneNumber]);

  const isButtonActive =
    telecom !== TELECOM_PLACEHOLDER &&
    phone.length >= 10 &&
    !smsVerification.isSending;

  return {
    expectedSsnFront,
    expectedSsnBack,
    telecom,
    phone,
    submitError,
    isTelecomModalVisible,
    isUpdating,
    isButtonActive,
    setPhone,
    setSubmitError,
    setIsTelecomModalVisible,
    handleSelectTelecom,
    handleSendCode,
    handleUpdatePhone,
    ...smsVerification,
  };
}
