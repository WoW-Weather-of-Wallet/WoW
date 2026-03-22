import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecureKeypad from '../common/SecureKeypad';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface AppLockModalProps {
  visible: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  isBiometricLoading?: boolean;
  errorMessage?: string;
  onSubmitPin: (pin: string) => Promise<boolean> | boolean;
  onPressBiometric: () => void;
  onPressLogout: () => void;
}

export default function AppLockModal({
  visible,
  biometricEnabled,
  pinEnabled,
  isBiometricLoading = false,
  errorMessage,
  onSubmitPin,
  onPressBiometric,
  onPressLogout,
}: AppLockModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPinInput('');
      setIsSubmittingPin(false);
    }
  }, [visible]);

  const handleAppendPin = async (digit: string) => {
    if (!pinEnabled || isSubmittingPin) {
      return;
    }

    const nextValue = `${pinInput}${digit}`.slice(0, 6);
    setPinInput(nextValue);

    if (nextValue.length !== 6) {
      return;
    }

    setIsSubmittingPin(true);

    try {
      const isValid = await onSubmitPin(nextValue);
      if (!isValid) {
        setPinInput('');
      }
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleDeletePin = () => {
    if (isSubmittingPin) {
      return;
    }

    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={wp(28)} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>앱 잠금 해제</Text>
          <Text style={styles.description}>
            저장된 세션을 유지한 상태로 앱을 열기 위해 본인 확인이 필요합니다.
          </Text>

          {pinEnabled ? (
            <>
              <View style={styles.pinDotsRow}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={`pin-dot-${index}`}
                    style={[
                      styles.pinDot,
                      index < pinInput.length && styles.pinDotFilled,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.pinHint}>간편 비밀번호 6자리를 입력해주세요.</Text>
            </>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {isBiometricLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>생체 인증을 확인하고 있어요.</Text>
            </View>
          ) : null}

          {biometricEnabled ? (
            <TouchableOpacity
              style={styles.biometricButton}
              activeOpacity={0.8}
              onPress={onPressBiometric}
              disabled={isBiometricLoading}
            >
              <Ionicons
                name="finger-print-outline"
                size={wp(18)}
                color={COLORS.textPrimary}
              />
              <Text style={styles.biometricButtonText}>생체 인증 사용</Text>
            </TouchableOpacity>
          ) : null}

          {pinEnabled ? (
            <SecureKeypad
              onPressNumber={(digit) => {
                void handleAppendPin(digit);
              }}
              onPressDelete={handleDeletePin}
            />
          ) : null}

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={onPressLogout}
          >
            <Text style={styles.logoutButtonText}>다른 계정으로 로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 24, 0.6)',
    justifyContent: 'center' as const,
    paddingHorizontal: wp(20),
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(20),
    paddingVertical: hp(24),
    alignItems: 'center' as const,
    gap: hp(12),
  },
  iconCircle: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(28),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.primarySoft,
  },
  title: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    textAlign: 'center' as const,
    fontSize: fp(14),
    lineHeight: fp(20),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  pinDotsRow: {
    flexDirection: 'row' as const,
    gap: wp(10),
    marginTop: hp(8),
  },
  pinDot: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: COLORS.gray100,
  },
  pinDotFilled: {
    backgroundColor: COLORS.primary,
  },
  pinHint: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  loadingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: wp(8),
  },
  loadingText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  biometricButton: {
    minWidth: '100%' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: wp(8),
    paddingVertical: hp(12),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  biometricButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  logoutButton: {
    marginTop: hp(8),
    paddingVertical: hp(10),
  },
  logoutButtonText: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
};
