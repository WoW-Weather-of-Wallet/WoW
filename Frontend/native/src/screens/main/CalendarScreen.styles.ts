/**
 * CalendarScreen 스타일 정의
 * 캘린더 탭 화면의 전체 레이아웃을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  contentContainer: { paddingHorizontal: wp(20), gap: hp(18) },
  /** 캘린더/내역 탭 전환 영역 배경 */
  tabWrap: { backgroundColor: COLORS.background, borderRadius: RADIUS.xxl, padding: wp(8) },
});
