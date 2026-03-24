import { create } from 'zustand';
import { setNativeAuthToken } from '../services/auth';

interface AuthUser {
  userId?: string | null;
  name?: string;
  role?: string;
}

interface LoginSessionPayload {
  accessToken: string;
  user: AuthUser;
  autoLogin?: boolean;
  source?: 'manual' | 'restored' | 'ssafy';
  loginType?: 'NORMAL' | 'SSAFY' | string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  autoLoginEnabled: boolean;
  sessionSource: 'manual' | 'restored' | 'ssafy' | null;
  loginType: 'NORMAL' | 'SSAFY' | string | null;
  login: (payload: LoginSessionPayload) => void;
  updateAccessToken: (accessToken: string | null) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  autoLoginEnabled: false,
  sessionSource: null,
  loginType: null,

  login: ({ accessToken, user, autoLogin = false, source = 'manual', loginType = null }) => {
    setNativeAuthToken(accessToken);

    set({
      isAuthenticated: true,
      accessToken,
      user,
      autoLoginEnabled: autoLogin,
      sessionSource: source,
      loginType,
    });
  },

  updateAccessToken: (accessToken) => {
    setNativeAuthToken(accessToken);

    set((state) => ({
      accessToken,
      isAuthenticated: Boolean(accessToken) || state.isAuthenticated,
    }));
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
    setNativeAuthToken(null);

    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      autoLoginEnabled: false,
      sessionSource: null,
      loginType: null,
    });
  },
}));
