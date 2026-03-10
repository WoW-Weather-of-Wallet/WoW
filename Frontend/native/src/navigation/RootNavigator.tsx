// =============================================
// RootNavigator - 앱 전체 네비게이션 구조
// Splash → Login → (회원가입/온보딩)
// 로그인 후: 하단 탭 (메인/캘린더/마이페이지)
// =============================================

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth 화면
import SplashScreen from '../screens/auth/SplashScreen';
import AccessPermissionScreen from '../screens/auth/AccessPermissionScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

// -----------------------------------------------
// 루트 스택 네비게이터
// 현재: Splash → Login 흐름
// TODO: 로그인 성공 시 Main 탭으로 전환 (백엔드 연결 후)
// -----------------------------------------------
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
        {/* 스플래시 화면 */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />
        {/* 접근 권한 허용 화면 */}
        <Stack.Screen
          name="Permission"
          component={AccessPermissionScreen}
          options={{ gestureEnabled: false }}
        />
        {/* 로그인 화면 */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}