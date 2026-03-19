/**
 * WelcomeScreen 스타일 정의
 * 회원가입 완료 환영 화면의 레이아웃을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mainLayout: { flex: 1 },
  scrollContent: { flex: 1 },
  scrollContentContainer: { paddingHorizontal: wp(28), paddingTop: hp(44), paddingBottom: hp(24) },
  headerSection: { alignItems: 'center', gap: hp(12) },
  iconContainer: { marginTop: hp(10) },
  titleBlock: { alignItems: 'center', gap: hp(10) },
  title: { fontSize: fp(30), fontFamily: FONTS.bold, color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: fp(16), fontFamily: FONTS.medium, color: COLORS.textSecondary, textAlign: 'center' },
  infoSection: { marginVertical: hp(24) },
  infoCard: { backgroundColor: COLORS.gray50, borderRadius: wp(18), paddingHorizontal: wp(20), paddingVertical: hp(20), gap: hp(14) },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { width: wp(92), fontSize: fp(15), fontFamily: FONTS.medium, color: COLORS.textTertiary },
  infoValue: { flex: 1, fontSize: fp(17), fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  bottomSection: { paddingHorizontal: wp(28), paddingTop: hp(12), backgroundColor: COLORS.background },
  confirmButton: { backgroundColor: COLORS.primary, borderRadius: wp(30), paddingVertical: hp(16), alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { fontSize: fp(20), fontFamily: FONTS.bold, color: COLORS.textInverse },
});
