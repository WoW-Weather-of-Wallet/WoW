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
  startButton: {
    height: hp(56),
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
