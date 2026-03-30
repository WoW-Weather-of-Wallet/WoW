import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from '../screens/main/MyPageScreen';
import WithdrawScreen from '../screens/mypage/WithdrawScreen';
import PhoneUpdateScreen from '../screens/mypage/PhoneUpdateScreen';
import type { MyPageStackParamList } from '../types';

const Stack = createNativeStackNavigator<MyPageStackParamList>();

/**
 * 마이페이지 탭 안에서 설정·회원탈퇴 화면까지 함께 관리합니다.
 * 이렇게 두면 하위 화면 진입 시에도 하단 탭 바가 유지됩니다.
 */
export default function MyPageStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPageHome" component={MyPageScreen} />
      {/* 회원 탈퇴: SMS 본인 인증 후 탈퇴를 진행하는 전용 화면 */}
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PhoneUpdate"
        component={PhoneUpdateScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
