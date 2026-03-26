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
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  highlightExtraBold: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.extraBold,
  },
  highlightBlack: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.black,
  },
  userNameHighlight: {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  },
  
  /**
   * [UI-Card] 공통 카드 스타일
   */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: wp(20),
    marginBottom: hp(24),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(16),
  },

  /**
   * [Section-A] 클러스터 요약
   */
  clusterBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(8),
  },
  clusterBadge: {
    backgroundColor: COLORS.primary + '20', // 투명도 적용
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: RADIUS.full,
    marginRight: wp(8),
  },
  clusterBadgeText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  clusterTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  clusterDesc: {
    fontSize: fp(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: fp(20),
    marginTop: hp(8),
  },

  /**
   * [Section-B] 과소비 막대 그래프
   */
  chartRow: {
    marginBottom: hp(16),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(6),
  },
  chartLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  chartSaving: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
  barContainer: {
    height: hp(8),
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    marginBottom: hp(4),
    overflow: 'hidden',
  },
  barFillMy: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  barFillAvg: {
    height: '100%',
    backgroundColor: COLORS.gray400,
    borderRadius: RADIUS.full,
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLegendText: {
    fontSize: fp(11),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },

  /**
   * [Section-C] 카테고리 비교 표 (Table)
   */
  tableContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    paddingVertical: hp(10),
    paddingHorizontal: wp(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: hp(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tableCellCat: { flex: 2.2, alignItems: 'flex-start', paddingLeft: wp(12) },
  tableCellPrice: { flex: 2.2, alignItems: 'flex-end', paddingRight: wp(12) },
  tableCellPct: { flex: 1.4, alignItems: 'flex-end', paddingRight: wp(12) },
  tableCellDiff: { flex: 1.5, alignItems: 'flex-end', paddingRight: wp(12) },
  vLine: {
    borderRightWidth: 1,
    borderRightColor: COLORS.gray100,
  },
  tableHeaderText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  tableDataText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  textDanger: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
  },
  textSafe: {
    color: COLORS.success || '#51CF66',
  },

  /**
   * [UI-Action] 더보기 / 접기 토글 버튼
   */
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    marginTop: hp(4),
  },
  toggleButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginRight: wp(4),
  },

  /**
   * [Section-D] GMS 피드백 텍스트
   */
  feedbackSection: {
    marginBottom: hp(20),
  },
  feedbackTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(8),
  },
  feedbackText: {
    fontSize: fp(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: fp(22),
  },
  feedbackHighlight: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.extraBold,
  },
  feedbackHighlightStrong: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.black,
  },

  /**
   * [UX-Navigation] 하단 버튼
   */
  bottomSection: {
    marginTop: hp(10),
  },
});
