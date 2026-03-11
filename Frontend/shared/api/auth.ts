// =============================================
// Auth API helpers
// 현재 백엔드에 실제로 구현된 엔드포인트만 먼저 연결합니다.
// 서버에 아직 없는 SMS / 이메일 인증 API 는 여기서 빼 두고,
// 화면에서는 기존 목업 흐름을 유지한 채 나중에 붙일 수 있게 합니다.
// =============================================

import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import type {
  LoginRequest,
  LoginResponse,
  SaveOnboardingRequest,
  SaveOnboardingResponse,
  SignupRequest,
  SignupResponse,
  UserProfileResponse,
} from '../types/auth';

// -----------------------------------------------
// signup
// CreateAccount 화면에서 최종 회원가입 요청을 보낼 때 사용합니다.
// 현재 백엔드는 userId / pw 필드를 기대하므로 화면 state 를 이 구조로 변환해야 합니다.
// -----------------------------------------------
export const signup = async (payload: SignupRequest) => {
  const response = await axiosInstance.post<SignupResponse>(ENDPOINTS.AUTH.SIGNUP, payload);

  return response.data;
};

// -----------------------------------------------
// login
// 로그인 성공 시 accessToken 을 받고, 이후 setAuthToken 으로 공통 헤더를 동기화할 수 있습니다.
// -----------------------------------------------
export const login = async (payload: LoginRequest) => {
  const response = await axiosInstance.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload);

  return response.data;
};

// -----------------------------------------------
// getProfile
// 로그인 이후 홈/마이페이지에서 사용자 기본 정보를 받아올 때 사용합니다.
// -----------------------------------------------
export const getProfile = async () => {
  const response = await axiosInstance.get<UserProfileResponse>(ENDPOINTS.USER.PROFILE);

  return response.data;
};

// -----------------------------------------------
// saveOnboarding
// 현재 백엔드는 PATCH /api/v1/user/onboarding 으로 처리합니다.
// 화면에서 선택한 값을 회원 정보에 반영하는 용도로 사용합니다.
// -----------------------------------------------
export const saveOnboarding = async (payload: SaveOnboardingRequest) => {
  const response = await axiosInstance.patch<SaveOnboardingResponse>(
    ENDPOINTS.USER.ONBOARDING,
    payload,
  );

  return response.data;
};
