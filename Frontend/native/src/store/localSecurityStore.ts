import { create } from 'zustand';
import {
  clearPinCode,
  hasLocalSecurityEnabled,
  loadLocalSecurityPreferences,
  savePinCode,
  setBiometricEnabled as persistBiometricEnabled,
  type LocalSecurityPreferences,
} from '../services/localSecurity';

interface LocalSecurityState {
  preferences: LocalSecurityPreferences;
  isLoaded: boolean;
  isAppLocked: boolean;
  lockReason: 'launch' | 'resume' | null;
  loadPreferences: () => Promise<LocalSecurityPreferences>;
  refreshPreferences: () => Promise<LocalSecurityPreferences>;
  setBiometricEnabled: (enabled: boolean) => Promise<LocalSecurityPreferences>;
  setPinCode: (pin: string) => Promise<LocalSecurityPreferences>;
  clearPinCode: () => Promise<LocalSecurityPreferences>;
  lockApp: (reason: 'launch' | 'resume') => void;
  unlockApp: () => void;
}

const DEFAULT_PREFERENCES: LocalSecurityPreferences = {
  biometricEnabled: false,
  pinEnabled: false,
};

export const useLocalSecurityStore = create<LocalSecurityState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isLoaded: false,
  isAppLocked: false,
  lockReason: null,

  loadPreferences: async () => {
    if (get().isLoaded) {
      return get().preferences;
    }

    const preferences = await loadLocalSecurityPreferences();
    set({
      preferences,
      isLoaded: true,
    });
    return preferences;
  },

  refreshPreferences: async () => {
    const preferences = await loadLocalSecurityPreferences();
    set({
      preferences,
      isLoaded: true,
    });
    return preferences;
  },

  setBiometricEnabled: async (enabled) => {
    const preferences = await persistBiometricEnabled(enabled);
    set({
      preferences,
      isLoaded: true,
    });
    return preferences;
  },

  setPinCode: async (pin) => {
    const preferences = await savePinCode(pin);
    set({
      preferences,
      isLoaded: true,
    });
    return preferences;
  },

  clearPinCode: async () => {
    const preferences = await clearPinCode();
    set({
      preferences,
      isLoaded: true,
    });
    return preferences;
  },

  lockApp: (reason) => {
    if (!hasLocalSecurityEnabled(get().preferences)) {
      return;
    }

    set({
      isAppLocked: true,
      lockReason: reason,
    });
  },

  unlockApp: () => {
    set({
      isAppLocked: false,
      lockReason: null,
    });
  },
}));
