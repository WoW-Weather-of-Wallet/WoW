import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * [UX-Design] 아이콘과 텍스트 사이의 간격 및 정렬을 담당합니다.
   */
  iconWrapper: {
    marginBottom: hp(40),
    height: hp(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: fp(28),
  },
  /**
   * [UI-Detail] 하단에 진행 상태를 시각적으로 보여주는 미세한 프로그레스 바입니다.
   */
  progressBarContainer: {
    position: 'absolute',
    bottom: hp(100),
    width: wp(200),
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  /**
   * [UX-Effect] 파동 효과를 위한 스타일입니다.
   */
  pulseRing: {
    position: 'absolute',
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  /**
   * [UX-Design] 마지막 완료 단계에서 아이콘을 더 크고 강조되게 보여주는 스타일입니다.
   */
  lastIconWrapper: {
    marginBottom: 0,
    height: hp(240),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
