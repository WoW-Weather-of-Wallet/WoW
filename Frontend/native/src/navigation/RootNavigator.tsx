// =============================================
// RootNavigator - 앱 전체 네비게이션 구조
// 인증 전 스택과 인증 후 메인 탭을 한 곳에서 관리합니다.
// =============================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import AccessPermissionScreen from '../screens/auth/AccessPermissionScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AccountRecoveryEntryScreen from '../screens/auth/AccountRecoveryEntryScreen';
import FindIdScreen from '../screens/auth/FindIdScreen';
import FindPwScreen from '../screens/auth/FindPwScreen';
import AccountRecoveryResultScreen from '../screens/auth/AccountRecoveryResultScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import TermsPdfScreen from '../screens/common/TermsPdfScreen';
import AiLoadingScreen from '../screens/ai/AiLoadingScreen';
import AiResultScreen from '../screens/ai/AiResultScreen';
import AiNotification from '../components/common/AiNotification';
import AppLockModal from '../components/auth/AppLockModal';
import { useNotificationObserver } from '../hooks/useNotificationObserver';
import { useAuthStore } from '../store/authStore';
import { fcmService } from '../services/fcmService';
import { clearPersistedAuthSession } from '../services/sessionStorage';
import {
  authenticateWithBiometrics,
  hasLocalSecurityEnabled,
  verifyPinCode,
} from '../services/localSecurity';
import { registerNativeAuthLifecycleCallbacks } from '../services/auth';
import { useLocalSecurityStore } from '../store/localSecurityStore';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef<any>();

/**
 * RootNavigator
 * 현재는 스크린 등록 자체는 유지하고, 진입 분기와 세션 상태만 authStore 로 관리합니다.
 * 이렇게 두면 로그인 직후/로그아웃 직후의 명시적 navigation 흐름을 깨지 않으면서도
 * 권한 화면 이후 분기와 공통 세션 상태는 한 곳에서 유지할 수 있습니다.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <NavigationWrapper />
    </NavigationContainer>
  );
}

/**
 * NavigationWrapper
 * NavigationContainer 내부에서만 사용할 수 있는 훅(useNavigation 등)을 관리합니다.
 */
function NavigationWrapper() {
  const {
    isAuthenticated,
    sessionSource,
    logout,
    updateAccessToken,
  } = useAuthStore();
  const {
    preferences,
    isLoaded,
    isAppLocked,
    lockReason,
    loadPreferences,
    lockApp,
    unlockApp,
  } = useLocalSecurityStore();
  const appStateRef = useRef(AppState.currentState);
  const restoredLockHandledRef = useRef(false);
  const [lockError, setLockError] = useState('');
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // FCM 알림 클릭 감지 및 페이지 이동 옵저버 활성화
  useNotificationObserver();

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    registerNativeAuthLifecycleCallbacks({
      onAccessTokenRefreshed: (accessToken) => {
        updateAccessToken(accessToken);
      },
      onSessionExpired: () => {
        logout();
        unlockApp();

        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      },
    });

    return () => registerNativeAuthLifecycleCallbacks({});
  }, [logout, unlockApp, updateAccessToken]);

  // [FCM] 인증 상태가 되면 토큰을 서버에 등록합니다.
  useEffect(() => {
    if (isAuthenticated) {
      // Zustand 상태 반영 및 axios default header 설정 대기 후 실행
      setTimeout(() => {
        fcmService.registerFcmToken();
      }, 500);
    }
  }, [isAuthenticated]);

  const startAppUnlock = useCallback(
    async (reason: 'launch' | 'resume') => {
      if (!isAuthenticated) {
        return;
      }

      const currentPreferences = isLoaded
        ? preferences
        : await loadPreferences();

      if (!hasLocalSecurityEnabled(currentPreferences)) {
        return;
      }

      setLockError('');
      lockApp(reason);

      if (!currentPreferences.biometricEnabled) {
        return;
      }

      setIsBiometricLoading(true);

      try {
        const result = await authenticateWithBiometrics(
          reason === 'launch'
            ? '앱을 열기 위해 생체 인증을 진행해주세요.'
            : '앱 잠금 해제를 위해 생체 인증을 진행해주세요.',
        );

        if (result.success) {
          setLockError('');
          unlockApp();
          return;
        }

        if (!currentPreferences.pinEnabled) {
          setLockError(result.errorMessage ?? '생체 인증에 실패했어요.');
        }
      } finally {
        setIsBiometricLoading(false);
      }
    },
    [isAuthenticated, isLoaded, loadPreferences, lockApp, preferences, unlockApp],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      restoredLockHandledRef.current = false;
      unlockApp();
      return;
    }

    if (sessionSource === 'restored' && isLoaded && !restoredLockHandledRef.current) {
      restoredLockHandledRef.current = true;
      void startAppUnlock('launch');
    }
  }, [isAuthenticated, isLoaded, sessionSource, startAppUnlock, unlockApp]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (
        isAuthenticated &&
        /inactive|background/.test(previousAppState) &&
        nextAppState === 'active'
      ) {
        void startAppUnlock('resume');
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, startAppUnlock]);

  const handleSubmitPin = useCallback(
    async (pin: string) => {
      const isValid = await verifyPinCode(pin, preferences);
      if (!isValid) {
        setLockError('간편 비밀번호가 올바르지 않아요.');
        return false;
      }

      setLockError('');
      unlockApp();
      return true;
    },
    [preferences, unlockApp],
  );

  const handleBiometricPress = useCallback(() => {
    void startAppUnlock(lockReason ?? 'resume');
  }, [lockReason, startAppUnlock]);

  const handleLockLogout = useCallback(async () => {
    await clearPersistedAuthSession();
    logout();
    unlockApp();

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [logout, unlockApp]);

  return (
    <>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen
          name="Permission"
          component={AccessPermissionScreen}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen
          name="PhoneAuth"
          component={PhoneAuthScreen}
          options={{ gestureEnabled: true }}
        />

        <Stack.Screen
          name="VerifyCode"
          component={VerifyCodeScreen}
          options={{ gestureEnabled: true }}
        />

        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 계정 찾기 화면 */}
        <Stack.Screen
          name="AccountRecoveryEntry"
          component={AccountRecoveryEntryScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right'
          }}
        />

        <Stack.Screen
          name="FindId"
          component={FindIdScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right'
          }}
        />

        <Stack.Screen
          name="FindPw"
          component={FindPwScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right'
          }}
        />

        <Stack.Screen
          name="AccountRecoveryResult"
          component={AccountRecoveryResultScreen}
          options={{
            gestureEnabled: false,
            animation: 'fade'
          }}
        />

        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right'
          }}
        />

        {/* 인증 이후 진입하는 메인 앱 영역 */}

        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen
          name="TermsPdf"
          component={TermsPdfScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />

        {/* AI 분석 흐름 */}
        <Stack.Screen
          name="AiLoading"
          component={AiLoadingScreen}
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="AiResult"
          component={AiResultScreen}
          options={{
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
      <AiNotification />
      <AppLockModal
        visible={isAuthenticated && isAppLocked}
        biometricEnabled={preferences.biometricEnabled}
        pinEnabled={preferences.pinEnabled}
        isBiometricLoading={isBiometricLoading}
        errorMessage={lockError}
        onSubmitPin={handleSubmitPin}
        onPressBiometric={handleBiometricPress}
        onPressLogout={() => {
          void handleLockLogout();
        }}
      />
    </>
  );
}
