import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AiFeedbackHomeScreen from '../screens/ai/AiFeedbackHomeScreen';
import AiLoadingScreen from '../screens/ai/AiLoadingScreen';
import AiResultScreen from '../screens/ai/AiResultScreen';
import type { AiFeedbackStackParamList } from '../types';

const Stack = createNativeStackNavigator<AiFeedbackStackParamList>();

/**
 * AI 피드백 탭 내부의 네비게이션 스택을 관리합니다.
 * 이를 통해 로딩 화면 및 결과 화면으로 이동해도 하단 앱 네비게이션 바가 유지됩니다.
 */
export default function AiFeedbackStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AiFeedbackHome" component={AiFeedbackHomeScreen} />
      <Stack.Screen
        name="AiLoading"
        component={AiLoadingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="AiResult"
        component={AiResultScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
