// =============================================
// Auth type definitions
// 현재 백엔드에 실제로 구현되어 있는 회원가입/로그인/프로필 스펙을 기준으로 정리합니다.
// shared 폴더는 웹/앱 공용이므로, 프론트 두 군데에서 재사용할 가능성이 높은 타입만 둡니다.
// =============================================

// -----------------------------------------------
// Domain primitives
// 백엔드 엔티티와 DTO 에서 실제로 쓰는 값만 먼저 공통 타입으로 뽑아 둡니다.
// -----------------------------------------------
export type Gender = 'M' | 'F';

// -----------------------------------------------
// Common API envelope
// 현재 사용자관리 API 문서는 httpStatusCode / responseMessage / data 형태를 공통 응답 래퍼로 사용합니다.
// 이후 다른 인증 API 도 같은 래퍼를 쓰게 되면 재사용할 수 있도록 먼저 공통 타입으로 둡니다.
// -----------------------------------------------
// -----------------------------------------------
// Signup
// POST /api/v1/auth/signup
// 일반 회원가입은 userId, SSAFY 회원가입은 ssafyOauthId를 사용합니다.
// 약관 동의와 알림 허용 여부를 함께 전송합니다.
// -----------------------------------------------
export interface SignupRequest {
  userId?: string;
  ssafyOauthId?: string;
  pw: string;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
  termsAgreed: boolean;
}

export interface SignupResponse {
  userId: string;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

// -----------------------------------------------
// Check user id
// GET /api/v1/auth/check-user-id?userId=...
// 회원가입 userId 중복확인 응답
// 사용 가능 여부와 화면 안내용 메시지를 함께 받습니다.
// -----------------------------------------------
export interface CheckUserIdResponse {
  isAvailable: boolean;
  message?: string;
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
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}
