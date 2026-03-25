import * as SecureStore from 'expo-secure-store';

export interface PersistedAuthUser {
  userId?: string | null;
  name?: string;
  role?: string;
}

export interface PersistedAuthSession {
  refreshToken: string;
  user: PersistedAuthUser;
  autoLoginEnabled: boolean;
  loginType?: 'NORMAL' | 'SSAFY' | string | null;
}

const AUTH_SESSION_KEY = 'wow.auth.session.v1';

const parseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('[sessionStorage] JSON parse failed:', error);
    return null;
  }
};

export const loadPersistedAuthSession = async () => {
  const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  return parseJson<PersistedAuthSession>(raw);
};

export const savePersistedAuthSession = async (session: PersistedAuthSession) => {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearPersistedAuthSession = async () => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};
