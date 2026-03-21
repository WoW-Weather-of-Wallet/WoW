import axios from 'axios';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://j14d106.p.ssafy.io';

export interface NativeSignupRequest {
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

export interface NativeSsafySignupCheckRequest {
  pendingToken: string;
  gender: string;
  phoneNumber: string;
  birthDate: string;
}

export interface NativeSsafyRegisterRequest extends NativeSsafySignupCheckRequest {
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

export interface NativeSsafyCodeLoginResult {
  type: 'login';
  code: string;
}

export interface NativeSsafyDirectLoginResult {
  type: 'login';
  accessToken: string;
  user?: {
    userId: string;
    name?: string;
    role?: string;
  };
}

export interface NativeSsafySignupCallbackResult {
  type: 'signup';
  pendingToken: string;
  name?: string;
}

export type NativeSsafyCallbackResult =
  | NativeSsafyCodeLoginResult
  | NativeSsafyDirectLoginResult
  | NativeSsafySignupCallbackResult;

export interface SmsSendRequest {
  phoneNumber: string;
}

export interface SmsVerifyRequest {
  phoneNumber: string;
  code: string;
}

export interface FindIdRequest {
  name: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
}

export interface SignupIdentityCheckRequest {
  name: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
}

export interface FindIdResponse {
  userId: string;
}

export interface FindPasswordRequest {
  userId: string;
  name: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  newPw: string;
}

export interface CheckUserIdResponse {
  isAvailable: boolean;
  message?: string;
}


export interface NativeApiErrorResponse {
  httpStatusCode?: number;
  errorMessage?: string;
}


export const nativeApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const normalizePhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/[^0-9]/g, '');

const PUBLIC_API_PREFIXES = [
  '/api/v1/auth/signup',
  '/api/v1/auth/login',
  '/api/v1/auth/sms/send',
  '/api/v1/auth/sms/verify',
  '/api/v1/auth/check-signup-identity',
  '/api/v1/auth/check-user-id',
  '/api/v1/auth/refresh',
  '/api/v1/auth/find/',
  '/api/v1/terms',
  '/sso/providers/ssafy/',
] as const;

const isPublicApiRequest = (url?: string) =>
  Boolean(url) && PUBLIC_API_PREFIXES.some((prefix) => url!.startsWith(prefix));

nativeApi.interceptors.request.use((config) => {
  /*
   * 이전 코드:
   * - login 이후 전역 Authorization 헤더가 nativeApi 기본값으로 남아 있었습니다.
   * - 그래서 회원가입, 문자 인증, SSAFY signup check 같은 공개 API에도 stale 토큰이 함께 전송될 수 있었습니다.
   *
   * 변경 이유:
   * - 공개 API는 인증 없이 호출되어야 하고, 남아 있던 토큰 때문에 백엔드 JWT 필터가 401을 반환할 수 있습니다.
   * - 공개 경로는 요청 직전에 Authorization 헤더를 제거해 기존 세션 영향을 차단합니다.
   */
  if (isPublicApiRequest(config.url)) {
    delete config.headers.Authorization;
  }

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
    nativeApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete nativeApi.defaults.headers.common.Authorization;
};

export const sendSmsCode = async (payload: SmsSendRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/send', {
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

export const verifySmsCode = async (payload: SmsVerifyRequest) => {
  const response = await nativeApi.post('/api/v1/auth/sms/verify', {
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
    code: payload.code.trim(),
  });
  return response.data;
};

export const checkSignupIdentity = async (payload: SignupIdentityCheckRequest) => {
  const response = await nativeApi.post('/api/v1/auth/check-signup-identity', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

export const checkUserId = async (userId: string): Promise<CheckUserIdResponse> => {
  const response = await nativeApi.get<any>('/api/v1/auth/check-user-id', {
    params: { userId },
  });

  return {
    isAvailable: response.data.available ?? response.data.isAvailable,
    message: response.data.message,
  };
};

export const signup = async (payload: NativeSignupRequest) => {
  const response = await nativeApi.post<NativeSignupResponse>('/api/v1/auth/signup', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

export const login = async (payload: NativeLoginRequest) => {
  const response = await nativeApi.post<NativeLoginResponse>('/api/v1/auth/login', payload);
  return response.data;
};

export const exchangeSsafyToken = async (code: string) => {
  const response = await nativeApi.post<NativeLoginResponse>('/sso/providers/ssafy/token', {
    code,
  });
  return response.data;
};

export const checkSsafySignup = async (payload: NativeSsafySignupCheckRequest) => {
  const response = await nativeApi.post('/sso/providers/ssafy/check', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

export const registerSsafy = async (payload: NativeSsafyRegisterRequest) => {
  const response = await nativeApi.post<NativeLoginResponse>('/sso/providers/ssafy/register', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
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
  const response = await nativeApi.patch('/api/v1/user/phone', {
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
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

export const findUserId = async (payload: FindIdRequest): Promise<FindIdResponse> => {
  const response = await nativeApi.post<FindIdResponse>('/api/v1/auth/find/id', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

export const findPassword = async (payload: FindPasswordRequest) => {
  const response = await nativeApi.post('/api/v1/auth/find/password', {
    ...payload,
    phoneNumber: normalizePhoneNumber(payload.phoneNumber),
  });
  return response.data;
};

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

const decodeUnicodeEscapes = (value: string | null) => {
  if (!value || !value.includes('\\u')) {
    return value;
  }

  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
};

export const parseSsafyCallbackUrl = (
  url: string,
): NativeSsafyCallbackResult | null => {
  try {
    const params = getSearchParamsFromUrl(url);
    const accessToken = getParamValue(params, ['accessToken', 'token']);
    const code = getParamValue(params, ['code']);
    const pendingToken = getParamValue(params, ['pendingToken']);
    const name = decodeUnicodeEscapes(getParamValue(params, ['name', 'userName', 'nickname'])) || undefined;

    if (pendingToken) {
      return {
        type: 'signup',
        pendingToken,
        name,
      };
    }

    if (code) {
      return {
        type: 'login',
        code,
      };
    }

    if (accessToken) {
      const userId = getParamValue(params, ['userId', 'loginId', 'username']) || 'ssafy-user';
      const role = getParamValue(params, ['role']) || undefined;

      return {
        type: 'login',
        accessToken,
        user: {
          userId,
          name,
          role,
        },
      };
    }

    return null;
  } catch (error) {
    console.log('[SSAFY callback parse failed]', error);
    return null;
  }
};
