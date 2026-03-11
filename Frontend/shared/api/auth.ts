// =============================================
// Auth API helpers
// 회원가입/로그인 흐름에서 사용하는 API 함수만 먼저 정리합니다.
// shared 폴더이므로 화면에서 실제로 바로 쓰일 함수 중심으로 최소 범위를 유지합니다.
// =============================================

import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  ConfirmEmailVerificationCodeRequest,
  ConfirmEmailVerificationCodeResponse,
  LoginRequest,
  LoginResponse,
  SaveOnboardingRequest,
  SaveOnboardingResponse,
  SendEmailVerificationCodeRequest,
  SendEmailVerificationCodeResponse,
  SendSmsCodeRequest,
  SendSmsCodeResponse,
  SignupRequest,
  SignupResponse,
  VerifySmsCodeRequest,
  VerifySmsCodeResponse,
} from '../types/auth';

// 휴대폰 인증번호 발송
export const sendSmsCode = async (payload: SendSmsCodeRequest) => {
  const response = await axiosInstance.post<ApiResponse<SendSmsCodeResponse>>(
    ENDPOINTS.AUTH.PHONE_SEND,
    payload,
  );

  return response.data;
};

// 휴대폰 인증번호 검증
export const verifySmsCode = async (payload: VerifySmsCodeRequest) => {
  const response = await axiosInstance.post<ApiResponse<VerifySmsCodeResponse>>(
    ENDPOINTS.AUTH.PHONE_VERIFY,
    payload,
  );

  return response.data;
};

// 이메일 중복 확인
export const checkEmailAvailability = async (payload: CheckEmailRequest) => {
  const response = await axiosInstance.get<ApiResponse<CheckEmailResponse>>(
    ENDPOINTS.AUTH.CHECK_EMAIL,
    {
      params: payload,
    },
  );

  return response.data;
};

// 이메일 인증번호 발송
export const sendEmailVerificationCode = async (
  payload: SendEmailVerificationCodeRequest,
) => {
  const response = await axiosInstance.post<ApiResponse<SendEmailVerificationCodeResponse>>(
    ENDPOINTS.AUTH.EMAIL_VERIFY_REQUEST,
    payload,
  );

  return response.data;
};

// 이메일 인증번호 검증
export const confirmEmailVerificationCode = async (
  payload: ConfirmEmailVerificationCodeRequest,
) => {
  const response = await axiosInstance.post<ApiResponse<ConfirmEmailVerificationCodeResponse>>(
    ENDPOINTS.AUTH.EMAIL_VERIFY_CONFIRM,
    payload,
  );

  return response.data;
};

// 회원가입
export const signup = async (payload: SignupRequest) => {
  const response = await axiosInstance.post<ApiResponse<SignupResponse>>(
    ENDPOINTS.AUTH.SIGNUP,
    payload,
  );

  return response.data;
};

// 로그인
export const login = async (payload: LoginRequest) => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    ENDPOINTS.AUTH.LOGIN,
    payload,
  );

  return response.data;
};

// 온보딩 저장
export const saveOnboarding = async (payload: SaveOnboardingRequest) => {
  const response = await axiosInstance.post<ApiResponse<SaveOnboardingResponse>>(
    ENDPOINTS.USER.ONBOARDING,
    payload,
  );

  return response.data;
};
