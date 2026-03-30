import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login, registerSsafy } from '../services/auth';
import type { RootNavigationProp } from '../types';
import type { SignupMode, WelcomeRouteParams } from '../types/auth';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { extractApiErrorMessage } from '../utils/error';
import { useAuthSessionLogin } from './useAuthSessionLogin';

const SSAFY_INVALID_STATE_MESSAGE = 'SSAFY 가입 정보를 찾을 수 없어요. 다시 로그인해 주세요.';
const NORMAL_INVALID_STATE_MESSAGE = '회원가입 정보가 없어요. 다시 로그인해 주세요.';
const SSAFY_REGISTER_FAILED_MESSAGE = 'SSAFY 회원가입 처리 중 문제가 발생했어요. 다시 시도해 주세요.';
const NORMAL_LOGIN_FAILED_MESSAGE = '가입은 완료됐지만 자동 로그인에 실패했어요. 다시 로그인해 주세요.';

export function useWelcomeFlow(routeParams: WelcomeRouteParams) {
  const navigation = useNavigation<RootNavigationProp>();
  const { completeAuthSession } = useAuthSessionLogin();
  const [isConfirming, setIsConfirming] = useState(false);

  const signupMode: SignupMode =
    routeParams.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';

  const resetToLogin = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const resetToMain = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }, [navigation]);

  const handleConfirm = useCallback(async () => {
    if (isConfirming) {
      return;
    }

    if (isSsafySignup) {
      if (!routeParams.pendingToken || !routeParams.birthDate || !routeParams.gender || !routeParams.phoneNumber) {
        Alert.alert('회원가입 오류', SSAFY_INVALID_STATE_MESSAGE);
        resetToLogin();
        return;
      }

      setIsConfirming(true);
      try {
        const registerResponse = await registerSsafy({
          pendingToken: routeParams.pendingToken,
          phoneNumber: routeParams.phoneNumber,
          birthDate: routeParams.birthDate,
          gender: routeParams.gender,
          termsAgreed: routeParams.termsAgreed === true,
          alarmEnabled: routeParams.alarmEnabled !== false,
        });

        await completeAuthSession({
          response: registerResponse,
          loginType: 'SSAFY',
          source: 'ssafy',
        });

        resetToMain();
      } catch (error: any) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'signup',
          fallbackMessage: SSAFY_REGISTER_FAILED_MESSAGE,
        });
        Alert.alert(presentation.title, presentation.alertMessage);
      } finally {
        setIsConfirming(false);
      }
      return;
    }

    if (!routeParams.userId || !routeParams.pw) {
      Alert.alert('로그인 오류', NORMAL_INVALID_STATE_MESSAGE);
      resetToLogin();
      return;
    }

    setIsConfirming(true);
    try {
      const loginResponse = await login({
        userId: routeParams.userId,
        pw: routeParams.pw,
      });

      await completeAuthSession({
        response: loginResponse,
        loginType: 'NORMAL',
      });

      resetToMain();
    } catch (error: any) {
      const message = extractApiErrorMessage(error, NORMAL_LOGIN_FAILED_MESSAGE);
      Alert.alert('로그인 실패', message);
      resetToLogin();
    } finally {
      setIsConfirming(false);
    }
  }, [completeAuthSession, isConfirming, isSsafySignup, resetToLogin, resetToMain, routeParams]);

  return {
    isConfirming,
    isSsafySignup,
    signupMode,
    handleConfirm,
  };
}
