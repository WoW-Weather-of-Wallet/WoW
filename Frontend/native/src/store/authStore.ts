import { create } from 'zustand';
import { setNativeAuthToken } from '../services/auth';

interface AuthUser {
  userId: string;
  name?: string;
  role?: string;
}

interface LoginSessionPayload {
  accessToken: string;
  user: AuthUser;
  autoLogin?: boolean;
}

interface DevSessionPayload {
  userId?: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  autoLoginEnabled: boolean;
  login: (payload: LoginSessionPayload) => void;
  loginWithDevBypass: (payload?: DevSessionPayload) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  logout: () => void;
}

/**
 * authStore
 * 현재는 영구 저장소 없이 메모리 기준으로 로그인 상태만 관리합니다.
 * 즉 앱을 완전히 종료하면 세션이 사라지지만, 화면 전환/로그아웃/개발자 우회 흐름은 한 곳에서 관리할 수 있습니다.
 */
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  autoLoginEnabled: false,

  login: ({ accessToken, user, autoLogin = false }) => {
    // 로그인 성공 시 공통 Authorization 헤더를 즉시 동기화해 이후 API 호출이 같은 세션을 사용하게 합니다.
    setNativeAuthToken(accessToken);

    set({
      isAuthenticated: true,
      accessToken,
      user,
      autoLoginEnabled: autoLogin,
    });
  },

  loginWithDevBypass: (payload) => {
    // 개발 중 백엔드 없이 메인 UI 를 확인해야 할 때는 인증 상태만 열어 줍니다.
    // 실제 토큰은 없으므로 인증 API 호출이 필요한 기능은 여전히 실패할 수 있습니다.
    setNativeAuthToken(null);

    set({
      isAuthenticated: true,
      accessToken: null,
      user: {
        userId: payload?.userId ?? 'dev-user',
        name: payload?.name ?? '개발자',
        role: 'DEV',
      },
      autoLoginEnabled: false,
    });
  },

  updateUser: (payload) => {
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...payload,
          }
        : state.user,
    }));
  },

  logout: () => {
    // 로그아웃 시 메모리 세션과 공통 Authorization 헤더를 함께 정리합니다.
    setNativeAuthToken(null);

    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      autoLoginEnabled: false,
    });
  },
}));
