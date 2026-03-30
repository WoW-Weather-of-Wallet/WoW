import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  refreshSession,
  setNativeAuthToken,
} from '../services/auth';
import {
  clearPersistedAuthSession,
  loadPersistedAuthSession,
  savePersistedAuthSession,
} from '../services/sessionStorage';
import { useAuthStore } from '../store/authStore';
import type { RootNavigationProp } from '../types';

const SPLASH_MIN_DURATION_MS = 2500;

export function useSplashBootstrap() {
  const navigation = useNavigation<RootNavigationProp>();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      let nextRoute: 'Login' | 'MainTabs' = 'Login';
      const startedAt = Date.now();

      try {
        const persistedSession = await loadPersistedAuthSession();

        if (!persistedSession?.autoLoginEnabled || !persistedSession.refreshToken) {
          return;
        }

        const refreshed = await refreshSession(persistedSession.refreshToken);

        if (!isActive) {
          return;
        }

        await savePersistedAuthSession({
          ...persistedSession,
          refreshToken: refreshed.refreshToken,
        });

        setNativeAuthToken(refreshed.accessToken);
        login({
          accessToken: refreshed.accessToken,
          user: persistedSession.user,
          autoLogin: true,
          source: 'restored',
          loginType: persistedSession.loginType ?? null,
        });
        nextRoute = 'MainTabs';
      } catch (error) {
        console.warn('[Splash] session restore failed:', error);
        await clearPersistedAuthSession();
        logout();
        setNativeAuthToken(null);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, SPLASH_MIN_DURATION_MS - elapsed);

        setTimeout(() => {
          if (!isActive) {
            return;
          }

          navigation.replace(nextRoute);
        }, remaining);
      }
    };

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, [login, logout, navigation]);
}
