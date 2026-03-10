import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainHomeScreen from '../screens/main/MainHomeScreen';
import MyPageScreen from '../screens/main/MyPageScreen';
import { COLORS, FONTS, RADIUS, hp, wp, fp } from '../constants/theme';

const Tab = createBottomTabNavigator();

/**
 * MainTabNavigator
 * 인증 이후 진입하는 메인 앱 영역입니다.
 * 지금은 메인/마이 2개 탭만 두고, 추후 캘린더/리포트 탭이 생기면
 * 동일한 패턴으로 손쉽게 확장할 수 있도록 구성합니다.
 */
export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: hp(82) + insets.bottom,
            paddingBottom: insets.bottom + hp(10),
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        // route 이름 기준으로 아이콘을 분기해서 탭 추가 시 수정 포인트를 단순화합니다.
        tabBarIcon: ({ focused, color, size }) => {
          const iconName =
            route.name === 'MainHome'
              ? focused
                ? 'home'
                : 'home-outline'
              : focused
                ? 'person'
                : 'person-outline';

          return (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
      })}
    >
      <Tab.Screen
        name="MainHome"
        component={MainHomeScreen}
        options={{ tabBarLabel: '메인' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: wp(18),
    right: wp(18),
    bottom: hp(18),
    borderRadius: RADIUS.xxl,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingTop: hp(10),
    paddingHorizontal: wp(12),
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  tabBarLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: fp(11),
  },
  activeIconWrapper: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary50,
  },
});
