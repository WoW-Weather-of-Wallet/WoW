import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { findUserId, verifySmsCode } from '../services/auth';
import type { VerifyCodeRouteParams } from '../types/auth';
import type { RootNavigationProp } from '../types';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { buildIdentityProfile } from '../utils/authIdentity';
import { extractApiErrorMessage } from '../utils/error';

const INVALID_IDENTITY_MESSAGE = '본인 확인 정보를 다시 확인해 주세요.';
const INVALID_PHONE_MESSAGE = '휴대폰 번호 정보를 다시 확인해 주세요.';
const VERIFY_CODE_FALLBACK = '인증번호 확인에 실패했어요. 다시 시도해 주세요.';
const ACCOUNT_NOT_FOUND_MESSAGE = '입력한 정보와 일치하는 계정을 찾지 못했어요.';

export function useVerifyCodeFlow(params: VerifyCodeRouteParams) {
  const navigation = useNavigation<RootNavigationProp>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const signupMode = params.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isRecoveryFlow = params.flow === 'FindId' || params.flow === 'FindPw';

  const handleFindIdFlow = useCallback(async () => {
    const identityProfile = buildIdentityProfile(params.ssnFront, params.ssnBack);

    if (!identityProfile || !params.name || !params.phone) {
      throw new Error(INVALID_IDENTITY_MESSAGE);
    }

    try {
      const result = await findUserId({
        name: params.name,
        birthDate: identityProfile.birthDate,
        gender: identityProfile.gender,
        phoneNumber: params.phone,
      });

      navigation.navigate('AccountRecoveryResult', {
        name: params.name,
        userId: result.userId,
        userType: 'local',
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(error, ACCOUNT_NOT_FOUND_MESSAGE);

      if (error?.response?.status === 401) {
        navigation.navigate('AccountRecoveryResult', {
          name: params.name,
          userType: 'none',
        });
        return;
      }

      if (/SSAFY/i.test(message)) {
        navigation.navigate('AccountRecoveryResult', {
          name: params.name,
          userType: 'ssafy',
        });
        return;
      }

      throw error;
    }
  }, [navigation, params]);

  const handleFindPasswordFlow = useCallback(() => {
    navigation.navigate('ResetPassword', {
      userId: params.userId,
      name: params.name,
      ssnFront: params.ssnFront,
      ssnBack: params.ssnBack,
      phoneNumber: params.phone,
    });
  }, [navigation, params]);

  const handleSignupFlow = useCallback(() => {
    if (signupMode === 'ssafy') {
      const identityProfile = buildIdentityProfile(params.ssnFront, params.ssnBack);

      navigation.replace('Welcome', {
        signupMode: 'ssafy',
        pendingToken: params.pendingToken,
        name: params.name,
        birthDate: identityProfile?.birthDate,
        gender: identityProfile?.gender,
        phoneNumber: params.phone,
        termsAgreed: params.termsAgreed,
        alarmEnabled: true,
      });
      return;
    }

    navigation.replace('CreateAccount', params);
  }, [navigation, params, signupMode]);

  const submitVerifyCode = useCallback(
    async (finalCode: string) => {
      if (!params.phone) {
        setVerifyError(INVALID_PHONE_MESSAGE);
        Alert.alert('인증 오류', INVALID_PHONE_MESSAGE);
        return;
      }

      setIsVerifying(true);
      setVerifyError('');

      try {
        await verifySmsCode({
          phoneNumber: params.phone,
          code: finalCode,
        });

        if (params.flow === 'FindId') {
          await handleFindIdFlow();
          return;
        }

        if (params.flow === 'FindPw') {
          handleFindPasswordFlow();
          return;
        }

        handleSignupFlow();
      } catch (error: any) {
        let message = extractApiErrorMessage(error, VERIFY_CODE_FALLBACK);
        let alertTitle = '인증 오류';
        let alertMessage = message;

        if (
          (params.flow === 'FindId' || params.flow === 'FindPw') &&
          error?.response?.status === 401
        ) {
          message = ACCOUNT_NOT_FOUND_MESSAGE;
        } else {
          const presentation = buildAuthErrorPresentation(error, {
            flow: 'sms-verify',
            fallbackMessage: VERIFY_CODE_FALLBACK,
          });
          message = presentation.inlineMessage;
          alertTitle = presentation.title;
          alertMessage = presentation.alertMessage;
        }

        setVerifyError(message);
        Alert.alert(alertTitle, alertMessage);
      } finally {
        setIsVerifying(false);
      }
    },
    [handleFindIdFlow, handleFindPasswordFlow, handleSignupFlow, params],
  );

  return {
    isRecoveryFlow,
    isVerifying,
    verifyError,
    submitVerifyCode,
  };
}
