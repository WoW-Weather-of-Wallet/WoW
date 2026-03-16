// =============================================
// RootNavigator - 앱 전체 네비게이션 구조
// 인증 전 스택과 인증 후 메인 탭을 한 곳에서 관리합니다.
// =============================================

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import AccessPermissionScreen from '../screens/auth/AccessPermissionScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AccountRecoveryScreen from '../screens/auth/AccountRecoveryScreen';
import FindIdScreen from '../screens/auth/FindIdScreen';
import FindPwScreen from '../screens/auth/FindPwScreen';
import RecoveryResultScreen from '../screens/auth/RecoveryResultScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import SettingsScreen from '../screens/mypage/SettingsScreen';

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
          name="AccountRecovery"
          component={AccountRecoveryScreen}
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
          name="RecoveryResult"
          component={RecoveryResultScreen}
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
          name="Settings"
          component={SettingsScreen}
          options={{
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
