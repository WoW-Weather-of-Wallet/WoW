/**
 * CalendarScreen 스타일 정의
 * 캘린더 탭 화면의 전체 레이아웃을 관리합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  topDock: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(4),
    backgroundColor: COLORS.backgroundSecondary,
  },
  notice: {
    marginBottom: hp(12),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    // 토글바를 상단 고정 영역으로 옮겼기 때문에 본문 시작 간격을 줄여
    // 히어로/토글과 첫 카드 사이가 과하게 벌어지지 않도록 맞춥니다.
    paddingTop: hp(8),
    gap: hp(18),
  },
  tabWrap: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(8),
    marginTop: hp(6),
  },
});
