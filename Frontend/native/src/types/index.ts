// =============================================
// types/ - 앱 내부에서 공통으로 쓰는 타입 정의
// navigation, user, api 타입을 이 폴더에서 모아 관리합니다.
// =============================================

/**
 * 루트 스택 네비게이션 파라미터 정의
 * 인증 플로우와 메인 진입점을 한 타입에 모아 두면
 * 화면 이동 이름을 잘못 쓰는 실수를 줄일 수 있습니다.
 */
export type RootStackParamList = {
  Splash: undefined;
  Permission: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Main: undefined;
  PhoneAuth: undefined;
  VerifyCode: undefined;
  CreateAccount: undefined;
  MainTabs: undefined;
};

/**
 * 메인 하단 탭 파라미터 정의
 * 현재는 메인/마이 2개 탭만 사용하지만, 추후 캘린더/리포트 탭을
 * 추가할 때도 동일한 타입에 화면 이름을 확장하면 됩니다.
 */
export type MainTabParamList = {
  MainHome: undefined;
  MyPage: undefined;
};

/**
 * 사용자 기본 타입
 * 실제 백엔드 user 응답이 정리되면 shared/types/user.ts와 협의 후 맞추면 됩니다.
 */
export interface User {
  id: string;
  username: string;
  email: string;
}
