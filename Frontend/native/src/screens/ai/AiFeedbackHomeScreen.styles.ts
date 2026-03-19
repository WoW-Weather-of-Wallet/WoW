import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(24),
  },
  header: {
    marginTop: hp(20),
    marginBottom: hp(40),
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(36),
  },
  highlight: {
    color: COLORS.primary,
  },
  visualSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(20),
  },
  /**
   * [Glassmorphism-UI] 
   * 투명한 배경과 테두리를 활용해 세련된 시각적 효과를 부여한 컨테이너입니다.
   */
  glassCard: {
    width: wp(280),
    height: wp(280),
    borderRadius: RADIUS.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // 그림자 효과로 입체감 부여
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  pulseCircle: {
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  iconContainer: {
    zIndex: 1,
  },
  /**
   * [UX-Fix] 하단 시작하기 버튼 영역
   * 전체 화면 스크롤 시 마지막 요소가 탭 바에 가려지지 않도록 추가적인 간격을 유지합니다.
   */
  bottomSection: {
    paddingBottom: hp(20),
  },
  /**
   * [UI-Carousel] 기능 안내 카루셀 스타일
   */
  carouselContainer: {
    marginVertical: hp(30),
    height: hp(320),
  },
  featureCard: {
    width: wp(310), // ScrollView 가로 패딩 제외 실제 카드 너비
    height: hp(300),
    marginRight: wp(16),
    borderRadius: RADIUS.xxl,
    backgroundColor: '#FFFFFF', // 회색 사각형 방지를 위해 배경을 흰색으로 고정
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    padding: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    // 그림자 효과로 입체감
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconContainer: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    backgroundColor: 'rgba(103, 80, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  featureTitle: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: fp(15),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(22),
    paddingHorizontal: wp(10),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(30),
  },
  paginationDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // 가시성을 위해 연한 그레이로 변경
    marginHorizontal: wp(5),
  },
  paginationDotActive: {
    width: wp(20),
    backgroundColor: COLORS.primary,
  },
  /**
   * [UI-Mini-Preview] 미니 UI 실사형 프리뷰 스타일
   */
  /**
   * [UI-Mini-Preview] 미니 UI 실사형 프리뷰 스타일 (최종본)
   */
  previewContainer: {
    width: wp(120),
    height: hp(120),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(20),
    backgroundColor: 'transparent',
  },

  // 카드 공통 틀 (작은 UI 창)
  miniUICard: {
    width: wp(110),
    height: hp(100),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: wp(10),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },

  // 텍스트 스켈레톤 라인
  miniSkeletonLine: {
    height: hp(4),
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
  },

  // --- 1. 소비 분석 (MiniAnalysis) ---
  miniDonutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(6),
  },
  miniDonutBase: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  miniDonutActive: {
    position: 'absolute',
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    borderWidth: 4,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  miniDonutCenterText: {
    position: 'absolute',
    width: wp(12),
    height: hp(4),
    backgroundColor: 'rgba(102, 102, 238, 0.2)', // COLORS.primarySoft 유사
    borderRadius: 2,
  },
  miniCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  miniCategoryDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
  },
  miniCategoryBarBg: {
    flex: 1,
    height: hp(4),
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 2,
  },
  miniCategoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // --- 2. 절감 목표 (MiniGoal) ---
  miniGoalTop: {
    alignItems: 'center',
    gap: hp(4),
    marginTop: hp(4),
  },
  miniGoalAmount: {
    width: wp(50),
    height: hp(8),
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: hp(2),
  },
  miniProgressBarOuter: {
    height: hp(6),
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 3,
    marginTop: hp(10),
    position: 'relative', // 자식 absolute(플래그) 배치용
  },
  miniProgressBarInner: {
    width: '60%',
    height: '100%',
    backgroundColor: COLORS.chartBlue,
    borderRadius: 3,
  },
  miniProgressFlag: {
    position: 'absolute',
    top: -hp(8),
    left: '50%',
    width: wp(12),
    height: hp(10),
    backgroundColor: '#374151', // 어두운 깃발 색상
    borderRadius: 2,
  },
  miniBarChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: hp(20),
    marginTop: hp(6),
    paddingHorizontal: wp(2),
  },
  miniTrendBar: {
    width: wp(6),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // --- 3. 알림 (MiniNotif - 백그라운드는 유지하되 레이아웃 보정) ---
  miniPhoneOutline: {
    width: wp(74),
    height: hp(110),
    backgroundColor: '#FFFFFF', // 폰 배경도 흰색으로 통일
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    padding: wp(6),
    overflow: 'hidden',
  },
  miniPhoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(8),
  },
  miniProfileBlob: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  miniToast: {
    position: 'absolute',
    top: hp(10), // 상단 배치 유지
    left: wp(4),
    right: wp(4),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.sm,
    padding: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  miniToastIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
