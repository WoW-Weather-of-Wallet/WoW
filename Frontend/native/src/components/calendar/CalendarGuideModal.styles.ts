import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(24),
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: wp(28),
    padding: wp(24),
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(16),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: {
    height: hp(360), // [UX-Fix] 프레임 확장에 따른 페이저 높이 재조정
  },
  slide: {
    alignItems: 'center',
  },
  previewWrap: {
    marginBottom: hp(20),
    alignItems: 'center',
  },
  phoneFrame: {
    width: wp(200),
    height: hp(240), // [UX-Fix] 충분한 하단 여백 확보를 위해 높이 추가 확장
    borderRadius: wp(16),
    padding: wp(12),
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  previewCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: wp(10), // [UX-Fix] 내부 공간 확보를 위해 패딩 소폭 축소
    gap: hp(6),
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary50,
  },
  previewChipActive: {
    backgroundColor: COLORS.primary,
  },
  previewChipText: {
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  previewChipTextActive: {
    color: COLORS.white,
  },
  previewGhostButton: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  previewCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // [UX-Fix] rowGap 제거: 고정 높이 셀로 정렬 제어
  },
  previewCalendarCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'flex-start', // [UX-Fix] 상단 기준 정렬로 변경하여 텍스트 밀림 방지
    paddingTop: hp(4),
    height: hp(36), // [UX-Fix] 충분한 고정 높이 확보
    position: 'relative',
  },
  previewCalendarNumber: {
    fontSize: fp(9),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    height: hp(12),
    lineHeight: hp(12),
    textAlign: 'center',
    zIndex: 1, // [UX-Fix] 메모지 아이콘보다 앞에 보이도록 우선순위 부여
  },
  previewCalendarAmount: {
    marginTop: hp(3),
    fontSize: fp(6.5), // [UX-Fix] 긴 금액(12,000)이 잘리지 않도록 미세 조정
    fontFamily: FONTS.medium,
    color: COLORS.spentRed,
    height: hp(10),
    lineHeight: hp(10),
    textAlign: 'center',
    letterSpacing: -0.3, // [UX-Fix] 자간 축소로 밀집도 향상
  },
  previewMemoBadge: {
    position: 'absolute',
    top: hp(1),
    right: wp(3),
    zIndex: 0, // [UX-Fix] 숫자 뒤로 배치
  },
  detailWeatherCard: {
    width: '100%', // [UX-Fix] 가로 너비 100% 강제하여 여백 일관성 확보
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary50,
    padding: wp(10),
    gap: hp(6),
  },
  detailMetricRow: {
    width: '100%',
    flexDirection: 'row',
    gap: wp(6),
  },
  detailMetricCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    paddingVertical: hp(8),
    paddingHorizontal: wp(8),
    gap: hp(4),
  },
  detailMetricLabel: {
    fontSize: fp(9),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  detailMetricValue: {
    fontSize: fp(11),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  memoField: {
    width: '100%',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: wp(10),
    gap: hp(4),
  },
  memoFieldTitle: {
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  memoFieldBody: {
    fontSize: fp(9),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(14),
  },
  methodRow: {
    width: '100%', // [UX-Fix] 가로 너비 통일
    flexDirection: 'row',
    gap: wp(8),
  },
  methodChip: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: hp(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodChipLabel: {
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  methodChipLabelActive: {
    color: COLORS.white,
  },
  uploadCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.uploadBoxBorder,
    backgroundColor: COLORS.uploadBoxBackground,
    paddingVertical: hp(8),
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(4),
  },
  uploadCardTitle: {
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  uploadCardHint: {
    fontSize: fp(8),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  slideTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(24),
    textAlign: 'center',
  },
  footer: {
    marginTop: hp(12),
    alignItems: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(10),
  },
  indicatorDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: COLORS.gray300,
  },
  indicatorDotActive: {
    width: wp(18),
    backgroundColor: COLORS.primary,
  },
});
