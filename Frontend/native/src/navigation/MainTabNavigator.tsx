import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainHomeScreen from '../screens/main/MainHomeScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import AiFeedbackStackNavigator from './AiFeedbackStackNavigator';
import MyPageStackNavigator from './MyPageStackNavigator';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../constants/theme';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  const shouldHideTabBarForRoute = (routeName?: string) =>
    routeName === 'Withdraw' || routeName === 'PhoneUpdate';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const hideTabBar =
          route.name === 'MyPage' &&
          shouldHideTabBarForRoute(getFocusedRouteNameFromRoute(route) ?? 'MyPageHome');

        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: hideTabBar
            ? { display: 'none' }
            : [
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
        };
      }}
    >
      <Tab.Screen name="MainHome" component={MainHomeScreen} options={{ tabBarLabel: '메인' }} />
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: wp(16),
    right: wp(16),
    bottom: hp(8),
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingTop: hp(6),
    paddingHorizontal: wp(10),
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarItem: { paddingVertical: hp(2) },
  tabBarIcon: { marginTop: hp(1) },
  tabBarLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: fp(10.5),
    marginTop: hp(2),
  },
  iconWrapper: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary50,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
});
