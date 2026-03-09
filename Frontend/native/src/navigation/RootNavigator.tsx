// =============================================
// RootNavigator - 앱 전체 네비게이션 구조
// 로그인 전: Auth 스택 (로그인/회원가입/온보딩)
// 로그인 후: 하단 탭 (메인/캘린더/마이페이지)
// =============================================

import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// -----------------------------------------------
// 임시 화면 (실제 구현 시 screens/ 폴더로 분리)
// -----------------------------------------------
const MainScreen = () => null
const CalendarScreen = () => null
const MyPageScreen = () => null
const LoginScreen = () => null
const SignupScreen = () => null
const OnboardingScreen = () => null

// -----------------------------------------------
// 하단 탭 네비게이터 (로그인 후 진입)
// 메인 / 캘린더 / 마이페이지
// -----------------------------------------------
function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="메인" component={MainScreen} />
      <Tab.Screen name="캘린더" component={CalendarScreen} />
      <Tab.Screen name="마이페이지" component={MyPageScreen} />
    </Tab.Navigator>
  )
}

// -----------------------------------------------
// 루트 스택 네비게이터
// isAuthenticated 값에 따라 Auth 스택 / 탭 분기
// TODO: Zustand authStore의 isAuthenticated로 교체
// -----------------------------------------------
export default function RootNavigator() {
  const isAuthenticated = false // TODO: useAuthStore()로 교체

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // 비로그인 상태 - Auth 스택
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          // 로그인 상태 - 탭 네비게이터
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}