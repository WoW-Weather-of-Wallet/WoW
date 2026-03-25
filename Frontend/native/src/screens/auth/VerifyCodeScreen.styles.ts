/**
 * VerifyCodeScreen 스타일 정의
 * SMS 인증코드 입력 화면의 레이아웃을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: wp(28) },
  title: {
    fontSize: fp(28), fontFamily: FONTS.bold, color: COLORS.textPrimary,
    lineHeight: fp(40), letterSpacing: -0.5, marginBottom: hp(12),
  },
  subtitle: {
    fontSize: fp(16), fontFamily: FONTS.medium, color: COLORS.textTertiary, marginBottom: hp(32),
  },
  dotsContainer: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    gap: wp(16), marginTop: hp(48),
  },
  dot: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: COLORS.gray200 },
  dotFilled: { backgroundColor: COLORS.primary },
  loadingRow: { marginTop: hp(28), alignItems: 'center', gap: hp(10) },
  loadingText: { fontSize: fp(14), fontFamily: FONTS.medium, color: COLORS.textSecondary },
  errorText: { marginTop: hp(24), textAlign: 'center', fontSize: fp(14), fontFamily: FONTS.medium, color: COLORS.error },
  keypadWrapper: { backgroundColor: COLORS.background },
});
