import { useCallback } from 'react';
import type { NativeLoginResponse } from '../services/auth';
import { savePersistedAuthSession } from '../services/sessionStorage';
import { useAuthStore } from '../store/authStore';

type SessionSource = 'manual' | 'restored' | 'ssafy';
type LoginType = 'NORMAL' | 'SSAFY';

interface CompleteAuthSessionParams {
  response: NativeLoginResponse;
  loginType: LoginType;
  source?: SessionSource;
  autoLogin?: boolean;
}

export function useAuthSessionLogin() {
  const loginToStore = useAuthStore((state) => state.login);

  const completeAuthSession = useCallback(
    async ({
      response,
      loginType,
      source = 'manual',
      autoLogin = true,
    }: CompleteAuthSessionParams) => {
      if (response.refreshToken) {
        await savePersistedAuthSession({
          refreshToken: response.refreshToken,
          user: response.user,
          autoLoginEnabled: autoLogin,
          loginType,
        });
      }

      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
        source,
        loginType,
      });
    },
    [loginToStore],
  );

  return { completeAuthSession };
}
