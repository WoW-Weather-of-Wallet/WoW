/**
 * SplashScreen 스타일 정의
 * 앱 시작 시 로고 애니메이션 화면의 레이아웃을 관리합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: wp(200),
    height: wp(200),
  },
});
