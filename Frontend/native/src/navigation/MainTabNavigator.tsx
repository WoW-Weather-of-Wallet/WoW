import React from 'react';
import { View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainHomeScreen from '../screens/main/MainHomeScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import AiFeedbackStackNavigator from './AiFeedbackStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import { COLORS, FONTS, LAYOUT, fp } from '../constants/theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  const shouldHideTabBarForRoute = (routeName?: string) =>
    routeName === 'Withdraw' || routeName === 'PhoneUpdate';

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => {
        const hideTabBar =
          route.name === 'MyPage' &&
          shouldHideTabBarForRoute(getFocusedRouteNameFromRoute(route) ?? 'MyPageHome');

        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: LAYOUT.tabBarHeight + insets.bottom,
                backgroundColor: COLORS.background,
                borderTopWidth: 1,
                borderColor: COLORS.surfaceBorder,
                paddingTop: LAYOUT.tabBarTopPadding,
                paddingBottom: Math.max(insets.bottom, LAYOUT.tabBarBottomPadding),
                paddingHorizontal: 8,
                shadowColor: COLORS.textPrimary,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 8,
              },
          tabBarItemStyle: { paddingVertical: LAYOUT.tabBarItemPaddingVertical },
          tabBarLabelStyle: {
            fontFamily: FONTS.semiBold,
            fontSize: fp(10.5),
            marginTop: LAYOUT.tabBarLabelMarginTop,
          },
          tabBarIconStyle: { marginTop: LAYOUT.tabBarIconMarginTop },
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
              <View
                className="items-center justify-center"
                style={{
                  width: LAYOUT.tabBarIconBoxSize,
                  height: LAYOUT.tabBarIconBoxSize,
                }}
              >
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
        };
      }}
    >
      <Tab.Screen name="MainHome" component={MainHomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: '캘린더' }} />
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
