import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  IdentityVerificationData,
  PhoneAuthRouteParams,
  SignupMode,
} from '../types/auth';
import type { RootNavigationProp } from '../types';
import {
  checkSignupIdentity,
  checkSsafySignup,
  sendSmsCode,
} from '../services/auth';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { buildIdentityProfile } from '../utils/authIdentity';
import { validateName, validatePhone } from '../utils/validation';

const INVALID_IDENTITY_MESSAGE = '주민등록번호를 다시 확인해 주세요.';
const SSAFY_TOKEN_EXPIRED_MESSAGE =
  'SSAFY 인증 정보가 만료되었습니다. 다시 로그인해 주세요.';
const SEND_CODE_FALLBACK =
  '인증번호 전송에 실패했어요. 입력한 정보를 다시 확인해 주세요.';

interface UsePhoneAuthFlowOptions {
  routeParams: PhoneAuthRouteParams;
  signupMode: SignupMode;
}

export function usePhoneAuthFlow({
  routeParams,
  signupMode,
}: UsePhoneAuthFlowOptions) {
  const navigation = useNavigation<RootNavigationProp>();
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingIdentityData, setPendingIdentityData] =
    useState<IdentityVerificationData | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isSsafySignup = signupMode === 'ssafy';

  const clearSubmitError = useCallback(() => {
    setSubmitError('');
  }, []);

  const handleIdentityComplete = useCallback((data: IdentityVerificationData) => {
    setPendingIdentityData(data);
    setTermsVisible(true);
  }, []);

  const handleTermsClose = useCallback(() => {
    setTermsVisible(false);
  }, []);

  const handleTermsConfirm = useCallback(
    async (agreedTerms: boolean) => {
      if (isSendingCode || !pendingIdentityData) {
        return;
      }

      setTermsVisible(false);
      setIsSendingCode(true);
      setSubmitError('');

      const nameValidation = validateName(pendingIdentityData.name);
      if (!nameValidation.isValid) {
        setSubmitError(nameValidation.message);
        setIsSendingCode(false);
        return;
      }

      const phoneValidation = validatePhone(pendingIdentityData.phone);
      if (!phoneValidation.isValid) {
        setSubmitError(phoneValidation.message);
        setIsSendingCode(false);
        return;
      }

      const identityProfile = buildIdentityProfile(
        pendingIdentityData.ssnFront,
        pendingIdentityData.ssnBack,
      );

      if (!identityProfile) {
        setSubmitError(INVALID_IDENTITY_MESSAGE);
        setIsSendingCode(false);
        return;
      }

      const normalizedPhoneNumber = pendingIdentityData.phone.replace(/[^0-9]/g, '');

      try {
        if (isSsafySignup) {
          if (!routeParams.pendingToken) {
            throw new Error(SSAFY_TOKEN_EXPIRED_MESSAGE);
          }

          await checkSsafySignup({
            pendingToken: routeParams.pendingToken,
            gender: identityProfile.gender,
            birthDate: identityProfile.birthDate,
            phoneNumber: normalizedPhoneNumber,
          });
        } else {
          await checkSignupIdentity({
            name: pendingIdentityData.name.trim(),
            gender: identityProfile.gender,
            birthDate: identityProfile.birthDate,
            phoneNumber: normalizedPhoneNumber,
          });
        }

        await sendSmsCode({ phoneNumber: normalizedPhoneNumber });

        navigation.navigate('VerifyCode', {
          ...routeParams,
          signupMode,
          name: pendingIdentityData.name.trim(),
          ssnFront: pendingIdentityData.ssnFront,
          ssnBack: pendingIdentityData.ssnBack,
          telecom: pendingIdentityData.telecom,
          phone: normalizedPhoneNumber,
          // 다음 화면들도 기존 boolean 계약을 그대로 사용하므로
          // 여기서는 "필수 약관 전체 동의" 의미로 넘깁니다.
          termsAgreed: agreedTerms,
        });
      } catch (error: any) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'sms-send',
          fallbackMessage: SEND_CODE_FALLBACK,
        });
        setSubmitError(presentation.inlineMessage);
        Alert.alert(
          isSsafySignup ? 'SSAFY 회원가입 안내' : presentation.title,
          presentation.alertMessage,
        );
      } finally {
        setIsSendingCode(false);
      }
    },
    [isSendingCode, isSsafySignup, navigation, pendingIdentityData, routeParams, signupMode],
  );

  return {
    termsVisible,
    isSendingCode,
    submitError,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
    clearSubmitError,
  };
}
