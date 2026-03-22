import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainHomeScreen from '../screens/main/MainHomeScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import AiFeedbackStackNavigator from './AiFeedbackStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import { styles } from './MainTabNavigator.styles';
import { COLORS, hp } from '../constants/theme';

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator
 * 현재 앱에서 실제로 먼저 보여줄 3개 탭만 유지합니다.
 * 메인 / 캘린더 / 마이페이지 흐름을 기준으로, 화면이 더 생기면 이후에 확장합니다.
 */
export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        // 기존 카드형 탭바 느낌은 유지하되, 길이와 그림자를 줄여서
        // 화면 위로 붕 떠 보이는 인상을 약하게 만듭니다.
        tabBarStyle: [
          styles.tabBar,
          {
            height: hp(58) + insets.bottom,
            paddingBottom: insets.bottom + hp(4),
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'MainHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AiFeedback') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={focused ? styles.activeIconWrapper : styles.iconWrapper}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="MainHome"
        component={MainHomeScreen}
        options={{ tabBarLabel: '메인' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: '캘린더' }}
      />
      <Tab.Screen
        name="AiFeedback"
        component={AiFeedbackStackNavigator}
        options={{ tabBarLabel: 'AI 피드백' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageStackNavigator}
        options={{ tabBarLabel: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}


