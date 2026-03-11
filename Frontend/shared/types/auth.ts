// =============================================
// Auth type definitions
// 현재 백엔드에 실제로 구현되어 있는 회원가입/로그인/프로필/온보딩 스펙을 기준으로 정리합니다.
// shared 폴더는 웹/앱 공용이므로, 프론트 두 군데에서 재사용할 가능성이 높은 타입만 둡니다.
// =============================================

// -----------------------------------------------
// Domain primitives
// 백엔드 엔티티와 DTO 에서 실제로 쓰는 값만 먼저 공통 타입으로 뽑아 둡니다.
// -----------------------------------------------
export type Gender = 'M' | 'F';

// -----------------------------------------------
// Signup
// POST /api/v1/auth/signup
// 현재 백엔드는 userId / pw 이름으로 요청을 받습니다.
// 프론트 UI 의 id / password 상태값과는 이름이 다르므로 연결 시 매핑이 필요합니다.
// -----------------------------------------------
export interface SignupRequest {
  userId: string;
  jobId: number;
  pw: string;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

export interface SignupResponse {
  userId: string;
  jobName: string | null;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

// -----------------------------------------------
// Login
// POST /api/v1/auth/login
// refreshToken 은 아직 백엔드 응답에 없고, accessToken 만 body 로 내려옵니다.
// -----------------------------------------------
export interface LoginRequest {
  userId: string;
  pw: string;
}

export interface AuthUserSummary {
  userId: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUserSummary;
}

// -----------------------------------------------
// Profile
// GET /api/v1/user/profile
// 회원가입 직후 응답과 거의 비슷한 구조라 화면 렌더링 시 재사용하기 좋습니다.
// -----------------------------------------------
export interface UserProfileResponse {
  userId: string;
  jobName: string | null;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

// -----------------------------------------------
// Onboarding
// PATCH /api/v1/user/onboarding
// 현재 백엔드는 jobId 를 받지 않고, 성별/전화번호/생년월일/알림여부만 받습니다.
// 추후 스펙이 바뀌면 이 타입과 API 함수만 바꾸면 화면 코드는 유지하기 쉽습니다.
// -----------------------------------------------
export interface SaveOnboardingRequest {
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

export type SaveOnboardingResponse = UserProfileResponse;
