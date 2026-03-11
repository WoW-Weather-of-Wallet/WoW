import axios from 'axios';

// =============================================
// Native auth API client
// Expo Go 환경에서 안정적으로 쓰기 위해 네이티브 전용 auth 클라이언트를 둡니다.
// 로컬 스프링 서버를 직접 붙일 때 사용합니다.
// export const BASE_URL = 'http://localhost:8080';
//
// Expo 실기기 테스트에서는 로컬 네트워크 이슈가 잦아서,
// 현재는 SSAFY 배포 서버를 기본값으로 사용합니다.
// =============================================
export const BASE_URL = 'https://j14d106.p.ssafy.io';

export interface NativeSignupRequest {
  userId: string;
  jobId: number;
  pw: string;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

export interface NativeSignupResponse {
  userId: string;
  jobName: string | null;
  name: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
  alarmEnabled: boolean;
}

export interface NativeLoginRequest {
  userId: string;
  pw: string;
}

export interface NativeLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    userId: string;
    name?: string;
    role?: string;
  };
}

export interface SmsSendRequest {
  phoneNumber: string;
}

export interface SmsVerifyRequest {
  phoneNumber: string;
  code: string;
}

const nativeApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

nativeApi.interceptors.request.use((config) => {
  console.log('[API request]', config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  console.log('[API request payload]', config.data);
  return config;
});

nativeApi.interceptors.response.use(
  (response) => {
    console.log('[API response]', response.status, response.config.url);
    console.log('[API response data]', response.data);
    return response;
  },
  (error) => {
    console.log('[API error message]', error?.message);
    console.log('[API error code]', error?.code);
    console.log('[API error status]', error?.response?.status);
    console.log('[API error data]', error?.response?.data);
    console.log('[API error url]', error?.config?.url);
    console.log(
      '[API error raw]',
      JSON.stringify({
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
        url: error?.config?.url,
      }),
    );
    return Promise.reject(error);
  },
);

export const setNativeAuthToken = (token: string | null) => {
  if (token) {
    nativeApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete nativeApi.defaults.headers.common.Authorization;
};

// 휴대폰 인증번호 발송
export const sendSmsCode = async (payload: SmsSendRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/send', payload);
  return response.data;
};

// 휴대폰 인증번호 검증
export const verifySmsCode = async (payload: SmsVerifyRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/verify', payload);
  return response.data;
};

export const signup = async (payload: NativeSignupRequest) => {
  const response = await nativeApi.post<NativeSignupResponse>('/api/v1/auth/signup', payload);
  return response.data;
};

export const login = async (payload: NativeLoginRequest) => {
  const response = await nativeApi.post<NativeLoginResponse>('/api/v1/auth/login', payload);
  return response.data;
};
