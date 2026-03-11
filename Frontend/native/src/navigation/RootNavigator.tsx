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
import MainTabNavigator from './MainTabNavigator';

// Onboarding 화면
import JobSelectionScreen from '../screens/onboarding/JobSelectionScreen';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator
 * 현재는 인증 성공 여부를 실제 상태값으로 분기하지 않고,
 * 로그인 버튼에서 MainTabs로 이동하도록 임시 연결해 둔 상태입니다.
 * authStore가 붙으면 Stack.Screen 조건 분기로 자연스럽게 이전할 수 있습니다.
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
        {/* 앱 첫 진입 시 보여주는 스플래시 화면 */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 권한 안내 화면 */}
        <Stack.Screen
          name="Permission"
          component={AccessPermissionScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 회원가입 시작용 휴대폰 인증 화면 */}
        <Stack.Screen
          name="PhoneAuth"
          component={PhoneAuthScreen}
          options={{ gestureEnabled: true }}
        />

        {/* 인증번호 입력 화면 */}
        <Stack.Screen
          name="VerifyCode"
          component={VerifyCodeScreen}
          options={{ gestureEnabled: true }}
        />

        {/* 비밀번호/아이디 생성 화면 */}
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 가입 환영 화면 */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 직업 선택 온보딩 화면 */}
        <Stack.Screen
          name="JobSelection"
          component={JobSelectionScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 로그인 화면 */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />

        {/* 인증 이후 진입하는 메인 앱 영역 */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
