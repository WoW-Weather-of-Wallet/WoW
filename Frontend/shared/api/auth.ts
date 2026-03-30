// =============================================
// Auth API helpers
// 현재 백엔드에 실제로 구현된 엔드포인트만 먼저 연결합니다.
// 화면에서 이미 쓰는 인증 플로우 위주로만 먼저 붙이고,
// 미확정 스펙은 화면을 깨지 않게 별도로 보류합니다.
// =============================================

import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import type {
  CheckUserIdResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  UserProfileResponse,
} from '../types/auth';

// -----------------------------------------------
// checkUserId
// 회원가입 화면의 "중복확인" 버튼에서 사용합니다.
// 현재 API 는 GET query parameter 로 userId 를 받는다고 명세를 맞췄습니다.
// -----------------------------------------------
export const checkUserId = async (userId: string): Promise<CheckUserIdResponse> => {
  const response = await axiosInstance.get(ENDPOINTS.AUTH.CHECK_USER_ID, {
    params: { userId },
  });

  return response.data as CheckUserIdResponse;
};

// -----------------------------------------------
// signup
// CreateAccount 화면에서 최종 회원가입 요청을 보낼 때 사용합니다.
// 현재 백엔드는 userId / pw 필드를 기대하므로 화면 state 를 이 구조로 변환해야 합니다.
// -----------------------------------------------
export const signup = async (payload: SignupRequest): Promise<SignupResponse> => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH.SIGNUP, payload);

  return response.data as SignupResponse;
};

// -----------------------------------------------
// login
// 로그인 성공 시 accessToken 을 받고, 이후 setAuthToken 으로 공통 헤더를 동기화할 수 있습니다.
// -----------------------------------------------
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, payload);

  return response.data as LoginResponse;
};

// -----------------------------------------------
// getProfile
// 로그인 이후 홈/마이페이지에서 사용자 기본 정보를 받아올 때 사용합니다.
// -----------------------------------------------
export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get(ENDPOINTS.USER.PROFILE);

  return response.data as UserProfileResponse;
};
