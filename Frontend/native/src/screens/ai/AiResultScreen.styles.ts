import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: hp(20),
    paddingBottom: hp(40),
  },
  header: {
    marginBottom: hp(32),
  },
  userName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: hp(4),
  },
  highlight: {
    color: COLORS.primary,
  },
  /**
   * [UI-Placeholder] 결과 리포트가 들어갈 영역의 카드 스타일입니다.
   */
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: wp(24),
    minHeight: hp(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  /**
   * [UX-Navigation] 다시 분석하기나 홈으로 돌아가는 버튼 영역입니다.
   */
  bottomSection: {
    marginTop: hp(24),
  },
});
