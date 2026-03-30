import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import SecureKeypad from '../common/SecureKeypad';

interface QuickLoginGateProps {
  visible: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  logoutNotice?: string;
  isBiometricLoading?: boolean;
  errorMessage?: string;
  onSubmitPin: (pin: string) => Promise<boolean> | boolean;
  onPressBiometric: () => void;
  onPressDifferentAccount: () => void;
  onToggleBiometric: (enabled: boolean) => void;
}

export default function QuickLoginGate({
  visible,
  biometricAvailable,
  biometricEnabled,
  pinEnabled,
  logoutNotice,
  isBiometricLoading = false,
  errorMessage,
  onSubmitPin,
  onPressBiometric,
  onPressDifferentAccount,
  onToggleBiometric,
}: QuickLoginGateProps) {
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

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark-outline" size={wp(32)} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>간편로그인</Text>
        <Text style={styles.description}>
          계정 로그인은 유지되어 있어요.{'\n'}
          계속하려면 등록된 간편수단으로 확인해 주세요.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.pinDotsRow}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={`quick-login-pin-dot-${index}`}
              style={[
                styles.pinDot,
                index < pinInput.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>
        <Text style={styles.pinHint}>간편비밀번호 6자리를 입력해 주세요.</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {biometricAvailable ? (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => onToggleBiometric(!biometricEnabled)}
          >
            <View
              style={[
                styles.checkbox,
                biometricEnabled && styles.checkboxChecked,
              ]}
            >
              {biometricEnabled ? (
                <Ionicons name="checkmark" size={wp(14)} color={COLORS.textInverse} />
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>다음부터 생체인증 사용</Text>
          </Pressable>
        ) : null}

        {biometricEnabled ? (
          <TouchableOpacity
            style={styles.biometricButton}
            activeOpacity={0.85}
            onPress={onPressBiometric}
            disabled={isBiometricLoading}
          >
            {isBiometricLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons
                  name="finger-print-outline"
                  size={wp(18)}
                  color={COLORS.primary}
                />
                <Text style={styles.biometricButtonText}>생체인증으로 로그인</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        <SecureKeypad
          onPressNumber={(digit) => {
            void handleAppendPin(digit);
          }}
          onPressDelete={handleDeletePin}
        />
      </View>

      <TouchableOpacity
        style={styles.secondaryAction}
        activeOpacity={0.7}
        onPress={onPressDifferentAccount}
      >
        <Text style={styles.secondaryActionText}>로그아웃</Text>
      </TouchableOpacity>
      {logoutNotice ? <Text style={styles.secondaryActionHint}>{logoutNotice}</Text> : null}
    </View>
  );
}

const styles = {
  container: {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(20),
    paddingTop: hp(92),
    paddingBottom: hp(32),
    justifyContent: 'space-between' as const,
  },
  header: {
    alignItems: 'center' as const,
    gap: hp(12),
  },
  logoCircle: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    textAlign: 'center' as const,
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(18),
    paddingVertical: hp(20),
    gap: hp(14),
  },
  pinDotsRow: {
    flexDirection: 'row' as const,
    alignSelf: 'center' as const,
    gap: wp(10),
    marginTop: hp(2),
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
    textAlign: 'center' as const,
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    textAlign: 'center' as const,
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  checkboxRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'center' as const,
    gap: wp(10),
  },
  checkbox: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.background,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  biometricButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: wp(8),
    borderRadius: RADIUS.md,
    paddingVertical: hp(12),
    backgroundColor: COLORS.primarySoft,
  },
  biometricButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  secondaryAction: {
    alignSelf: 'center' as const,
    paddingVertical: hp(12),
  },
  secondaryActionText: {
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
  secondaryActionHint: {
    marginTop: hp(12),
    textAlign: 'center' as const,
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
} as const;
