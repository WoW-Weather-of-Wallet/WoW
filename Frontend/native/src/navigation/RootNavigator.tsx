// =============================================
// RootNavigator - 앱 전체 네비게이션 구조
// 인증 전 스택과 인증 후 메인 탭을 한 곳에서 관리합니다.
// =============================================

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { useNotificationObserver } from '../hooks/useNotificationObserver';
import { useAuthStore } from '../store/authStore';
import { fcmService } from '../services/fcmService';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator
 * 현재는 스크린 등록 자체는 유지하고, 진입 분기와 세션 상태만 authStore 로 관리합니다.
 * 이렇게 두면 로그인 직후/로그아웃 직후의 명시적 navigation 흐름을 깨지 않으면서도
 * 권한 화면 이후 분기와 공통 세션 상태는 한 곳에서 유지할 수 있습니다.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <NavigationWrapper />
    </NavigationContainer>
  );
}

/**
 * NavigationWrapper
 * NavigationContainer 내부에서만 사용할 수 있는 훅(useNavigation 등)을 관리합니다.
 */
function NavigationWrapper() {
  const { isAuthenticated } = useAuthStore();

  // FCM 알림 클릭 감지 및 페이지 이동 옵저버 활성화
  useNotificationObserver();

  // [FCM] 인증 상태가 되면 토큰을 서버에 등록합니다.
  useEffect(() => {
    if (isAuthenticated) {
      // Zustand 상태 반영 및 axios default header 설정 대기 후 실행
      setTimeout(() => {
        fcmService.registerFcmToken();
      }, 500);
    }
  }, [isAuthenticated]);

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
    </>
  );
}
