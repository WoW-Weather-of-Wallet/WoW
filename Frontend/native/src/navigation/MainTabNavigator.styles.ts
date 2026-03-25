/**
 * MainTabNavigator 스타일 정의
 * 하단 탭 바의 레이아웃과 아이콘 스타일을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../constants/theme';

export const styles = StyleSheet.create({
  /** 하단 탭 바 — 플로팅 카드 스타일 */
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
  tabBarLabel: { fontFamily: FONTS.semiBold, fontSize: fp(10.5), marginTop: hp(2) },
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
