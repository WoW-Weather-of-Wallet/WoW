import axios from 'axios';

// =============================================
// Native auth API client
// Expo Go 환경에서 안정적으로 쓰기 위해 네이티브 전용 auth 클라이언트를 둡니다.
// Expo 에서는 EXPO_PUBLIC_* 변수만 런타임에 노출됩니다.
// 변경 사항:
// 기존에는 API 서버가 배포 주소로 고정되어 있어서 이 맥북 로컬 백엔드를 띄워도 앱이 원격 서버를 호출했습니다.
// 이제 Frontend/native/.env 의 EXPO_PUBLIC_API_BASE_URL 을 우선 사용하고,
// 값이 없을 때만 기존 배포 서버를 fallback 으로 사용합니다.
// =============================================
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://j14d106.p.ssafy.io';

export interface NativeSignupRequest {
  // 일반 회원가입은 userId, SSAFY 회원가입은 ssafyOauthId만 채운다.
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

export interface NativeSignupResponse {
  userId: string;
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
  refreshToken?: string;
  user: {
    userId: string;
    name?: string;
    role?: string;
  };
}

export interface NativeUserProfileResponse {
  userId?: string | null;
  name: string;
  gender?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  alarmEnabled: boolean;
  loginType?: 'NORMAL' | 'SSAFY' | string | null;
}

export interface NativeUpdateProfileRequest {
  name?: string;
  gender?: string;
  birthDate?: string;
}

export interface NativeUpdatePhoneRequest {
  phoneNumber: string;
}

export interface NativeChangePasswordRequest {
  currentPw: string;
  newPw: string;
}

/**
 * SSAFY OAuth callback result
 * SSAFY 로그인 완료 후 앱 딥링크에서 읽어오는 세션/가입 분기 정보
 */
export interface NativeSsafyCallbackResult {
  accessToken: string;
  user: {
    userId: string;
    name?: string;
    role?: string;
  };
  signupRequired: boolean;
}

export interface SmsSendRequest {
  phoneNumber: string;
}

export interface SmsVerifyRequest {
  phoneNumber: string;
  code: string;
}

export interface CheckUserIdResponse {
  // 일반 회원가입의 userId 중복확인 응답
  available: boolean;
  message?: string;
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
  if (config.method?.toUpperCase() === 'GET' && config.params) {
    console.log('[API request params]', config.params);
  } else {
    console.log('[API request payload]', config.data);
  }
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
    // 로그인 성공 시 메모리 상의 공통 Authorization 헤더를 갱신합니다.
    // 현재는 영구 저장소가 아니라 앱 실행 세션 동안만 유지됩니다.
    nativeApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  // 로그아웃 또는 토큰 만료 처리 시 이전 세션의 Authorization 헤더가 남지 않도록 제거합니다.
  delete nativeApi.defaults.headers.common.Authorization;
};

// 휴대폰 인증 단계에서 사용하는 SMS 발송 API
export const sendSmsCode = async (payload: SmsSendRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/send', payload);
  return response.data;
};

// VerifyCode 화면에서 사용하는 SMS 인증번호 검증 API
export const verifySmsCode = async (payload: SmsVerifyRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/verify', payload);
  return response.data;
};

// 일반 회원가입의 userId 중복확인 API
// EAS Build 환경에서 shared 폴더 의존성을 줄이기 위해 native 클라이언트에서 직접 호출한다.
export const checkUserId = async (userId: string): Promise<CheckUserIdResponse> => {
  const response = await nativeApi.get<CheckUserIdResponse>('/api/v1/auth/check-user-id', {
    params: { userId },
  });

  return response.data;
};

// 일반/SSAFY 회원가입 공용 signup API
export const signup = async (payload: NativeSignupRequest) => {
  const response = await nativeApi.post<NativeSignupResponse>('/api/v1/auth/signup', payload);
  return response.data;
};

// 일반 회원가입 완료 후 Welcome 화면에서 호출하는 자동 로그인 API
export const login = async (payload: NativeLoginRequest) => {
  const response = await nativeApi.post<NativeLoginResponse>('/api/v1/auth/login', payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await nativeApi.get<NativeUserProfileResponse>('/api/v1/user/profile');
  return response.data;
};

export const logout = async () => {
  const response = await nativeApi.post('/api/v1/auth/logout');
  return response.data;
};

export const updateProfile = async (payload: NativeUpdateProfileRequest) => {
  const response = await nativeApi.patch<NativeUserProfileResponse>('/api/v1/user/profile', payload);
  return response.data;
};

export const updatePhone = async (payload: NativeUpdatePhoneRequest) => {
  const response = await nativeApi.patch('/api/v1/user/phone', payload);
  return response.data;
};

export const changePassword = async (payload: NativeChangePasswordRequest) => {
  const response = await nativeApi.patch('/api/v1/auth/password', payload);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await nativeApi.delete('/api/v1/user/delete');
  return response.data;
};

/**
 * SSAFY 로그인 시작 URL
 * OAuth 진입과 callback 처리는 백엔드가 담당하므로 프론트는 해당 진입점만 엽니다.
 */
export const getSsafyLoginUrl = () => `${BASE_URL}/sso/providers/ssafy/login`;

const getSearchParamsFromUrl = (url: string) => {
  const normalizedUrl = url.replace('#', '?');
  return new URL(normalizedUrl).searchParams;
};

const getParamValue = (params: URLSearchParams, keys: string[]) => {
  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }

  return null;
};

/**
 * SSAFY callback URL 파싱
 * 로그인 성공 후 앱으로 돌아온 딥링크에서 세션 정보와 가입 필요 여부를 읽어옵니다.
 */
export const parseSsafyCallbackUrl = (
  url: string,
): NativeSsafyCallbackResult | null => {
  try {
    const params = getSearchParamsFromUrl(url);
    const accessToken = getParamValue(params, ['accessToken', 'token']);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      user: {
        userId: getParamValue(params, ['userId', 'loginId', 'username']) || 'ssafy-user',
        name: getParamValue(params, ['name', 'userName', 'nickname']) || undefined,
        role: getParamValue(params, ['role']) || undefined,
      },
      signupRequired:
        getParamValue(params, ['signupRequired', 'needsSignup', 'onboardingRequired']) === 'true',
    };
  } catch (error) {
    console.log('[SSAFY callback parse failed]', error);
    return null;
  }
};
