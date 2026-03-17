import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import CustomTextInput from '../../components/common/CustomTextInput';
import { findPassword } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { validatePassword } from '../../utils/validation';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userId, name, ssnFront, ssnBack, phoneNumber } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValidation = validatePassword(password, userId);
  const isPasswordValid = passwordValidation.isValid;
  const isFormValid =
    isPasswordValid &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  // Rebuild birthDate from the verified identity payload before calling the backend.
  const getBirthDateFromIdentity = () => {
    if (!ssnFront || !ssnBack || ssnFront.length !== 6) {
      return null;
    }

    const centuryCode = ssnBack[0];
    const century =
      centuryCode === '1' || centuryCode === '2' || centuryCode === '5' || centuryCode === '6'
        ? '19'
        : '20';

    return `${century}${ssnFront.slice(0, 2)}-${ssnFront.slice(2, 4)}-${ssnFront.slice(4, 6)}`;
  };

  const handleReset = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const birthDate = getBirthDateFromIdentity();

      if (!birthDate || !name || !phoneNumber) {
        throw new Error('Verified identity data is missing.');
      }

      // Password reset is submitted only after the SMS verification step is complete.
      await findPassword({
        userId,
        name,
        birthDate,
        phoneNumber,
        newPw: password,
      });

      Alert.alert(
        'Password updated',
        'Your password has been changed. Please sign in again.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        'Failed to update the password. Please try again.',
      );
      Alert.alert('Error', message);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(20) : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Set a new password.</Text>
            <Text style={styles.introSub}>
              Use 8 to 20 characters including letters, numbers, and symbols.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <CustomTextInput
                label="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter a new password"
              />
              {password.length > 0 && !isPasswordValid && (
                <Text style={styles.errorText}>* {passwordValidation.message}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <CustomTextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Enter the password again"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>* Passwords do not match.</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.mainButton, !isFormValid && styles.disabledButton]}
              onPress={() => void handleReset()}
              disabled={!isFormValid || isSubmitting}
            >
              <Text style={[styles.mainButtonText, !isFormValid && styles.disabledButtonText]}>
                Update Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* [Premium-UI] 네비게이션 바와의 겹침 방지를 위해 동적 여백 추가 */}
          <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56),
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(24), // 기본 여백을 줄이고 동적 여백으로 처리
  },
  introContainer: {
    marginBottom: hp(40),
  },
  introTitle: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(34),
    marginBottom: hp(8),
  },
  introSub: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  formContainer: {
    gap: hp(24),
  },
  inputWrapper: {
    width: '100%',
  },
  errorText: {
    fontSize: fp(12),
    color: '#EF4444',
    marginTop: hp(6),
    marginLeft: wp(4),
    fontFamily: FONTS.medium,
  },
  footer: {
    marginTop: hp(60),
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: COLORS.textTertiary,
  },
});
