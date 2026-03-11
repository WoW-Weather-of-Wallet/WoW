// =============================================
// Auth type definitions
// 회원가입/로그인/인증번호 검증 흐름에서 공통으로 사용하는 타입만 먼저 정리합니다.
// shared 폴더는 웹/앱 공용이므로 현재 프로젝트에 필요한 최소 범위만 정의합니다.
// =============================================

import type { User } from './user';

// -----------------------------------------------
// Common response wrappers
// 백엔드에서 최종 응답 포맷이 확정되면 여기에 맞춰 한 번에 정리할 수 있도록
// 성공 여부/메시지/데이터 구조를 느슨하게 감싸 둡니다.
// -----------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface EmptyResponse {
  success: boolean;
  message?: string;
}

// -----------------------------------------------
// SMS verification
// 회원가입의 첫 단계인 휴대폰 인증에 사용됩니다.
// -----------------------------------------------
export interface SendSmsCodeRequest {
  phoneNumber: string;
}

export interface SendSmsCodeResponse {
  requestId?: string;
  expiresInSeconds?: number;
}

export interface VerifySmsCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifySmsCodeResponse {
  verified: boolean;
}

// -----------------------------------------------
// Email validation
// 회원가입 화면에서 이메일 중복 확인과 이메일 인증에 사용됩니다.
// -----------------------------------------------
export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailResponse {
  available: boolean;
}

export interface SendEmailVerificationCodeRequest {
  email: string;
}

export interface SendEmailVerificationCodeResponse {
  expiresInSeconds?: number;
}

export interface ConfirmEmailVerificationCodeRequest {
  email: string;
  code: string;
}

export interface ConfirmEmailVerificationCodeResponse {
  verified: boolean;
}

// -----------------------------------------------
// Signup
// 백엔드 상세 스펙이 아직 유동적일 수 있어, 화면에서 바로 필요한 값 중심으로 둡니다.
// -----------------------------------------------
export type Gender = 'M' | 'F';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  gender?: Gender;
  birthDate?: string;
  agreedTermIds?: number[];
}

export interface SignupResponse {
  userId?: number;
  email?: string;
  signupCompleted?: boolean;
}

// -----------------------------------------------
// Login / token
// accessToken 은 메모리(Zustand)에서만 관리한다는 현재 원칙을 전제로 둡니다.
// refreshToken 은 httpOnly 쿠키 기반이라 응답 body 에 없을 수 있습니다.
// -----------------------------------------------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// -----------------------------------------------
// Onboarding
// 회원가입 직후 이어지는 선택 저장 API 에 사용됩니다.
// -----------------------------------------------
export interface SaveOnboardingRequest {
  jobId: number;
}

export interface SaveOnboardingResponse {
  saved: boolean;
}
