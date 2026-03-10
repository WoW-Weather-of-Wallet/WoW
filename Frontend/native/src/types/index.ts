// =============================================
// types/ - TypeScript 타입 정의 디렉토리
// 예: navigation.ts, api.ts, user.ts 등
// =============================================

/**
 * 네비게이션 파라미터 타입 정의
 * 각 화면에서 받을 수 있는 파라미터를 정의
 */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Main: undefined;
};

/**
 * 사용자 타입 (백엔드 연결 시 사용)
 */
export interface User {
  id: string;
  username: string;
  email: string;
}
