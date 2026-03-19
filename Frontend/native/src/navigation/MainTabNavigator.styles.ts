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
    left: wp(12),
    right: wp(12),
    bottom: hp(2),
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    paddingTop: hp(4),
    paddingHorizontal: wp(8),
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBarItem: { paddingVertical: hp(1) },
  tabBarIcon: { marginTop: hp(1) },
  tabBarLabel: { fontFamily: FONTS.semiBold, fontSize: fp(11), marginTop: hp(1) },
  iconWrapper: { width: wp(30), height: wp(30), alignItems: 'center', justifyContent: 'center' },
  activeIconWrapper: {
    width: wp(30), height: wp(30), borderRadius: wp(15),
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary50,
  },
});
