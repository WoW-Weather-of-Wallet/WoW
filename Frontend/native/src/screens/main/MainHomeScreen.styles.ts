/**
 * MainHomeScreen 스타일 정의
 * 메인 홈 화면의 전체 레이아웃을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  contentContainer: { paddingHorizontal: wp(20), gap: hp(18) },
});
