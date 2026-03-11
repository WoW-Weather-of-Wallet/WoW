import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { signup } from '../../../../shared/api/auth';

// 현재 백엔드 회원가입 API 는 jobId 를 필수로 받고 있습니다.
// 하지만 현재 앱 플로우에서는 직업 선택이 회원가입 뒤에 오므로,
// 백엔드 스펙이 정리되기 전까지는 임시 기본값으로 요청을 보냅니다.
const TEMP_SIGNUP_JOB_ID = 30;

type CreateAccountRouteParams = {
  name?: string;
  phone?: string;
  ssnFront?: string;
  ssnBack?: string;
};

/**
 * 주민등록번호 앞/뒷자리를 기반으로 생년월일을 YYYY-MM-DD 형태로 만듭니다.
 * 현재 회원가입 화면은 생년월일 입력을 따로 받지 않기 때문에,
 * 휴대폰 인증 단계에서 수집한 값을 회원가입 요청으로 변환합니다.
 */
const buildBirthDate = (ssnFront?: string, ssnBack?: string) => {
  if (!ssnFront || ssnFront.length !== 6 || !ssnBack) {
    return '2000-01-01';
  }

  const yearPrefix = ['1', '2', '5', '6'].includes(ssnBack) ? '19' : '20';
  const year = `${yearPrefix}${ssnFront.slice(0, 2)}`;
  const month = ssnFront.slice(2, 4);
  const day = ssnFront.slice(4, 6);

  return `${year}-${month}-${day}`;
};

/**
 * 주민등록번호 뒷자리 첫 숫자를 성별 값으로 변환합니다.
 * 현재 백엔드는 문자열 한 글자("M" | "F")를 기대합니다.
 */
const buildGender = (ssnBack?: string) => {
  if (!ssnBack) {
    return 'M';
  }

  return ['1', '3', '5', '7', '9'].includes(ssnBack) ? 'M' : 'F';
};

export default function CreateAccountScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const routeParams = (route?.params ?? {}) as CreateAccountRouteParams;

  const [step, setStep] = useState(1);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 비밀번호 입력은 필요할 때만 노출해서 가독성을 높입니다.
  const [isPwVisible, setIsPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  /**
   * 현재 백엔드에 아이디 중복 확인 API 가 없어서,
   * 화면 단계 검증을 위한 임시 체크만 로컬에서 수행합니다.
   * 실제 중복 여부는 회원가입 요청 결과를 받아 최종적으로 판단해야 합니다.
   */
  const handleCheckId = () => {
    if (id.length < 4) {
      return;
    }

    setIsCheckingId(true);
    setTimeout(() => {
      setIsCheckingId(false);

      if (id.toLowerCase() === 'admin') {
        setIsIdAvailable(false);
        return;
      }

      setIsIdAvailable(true);

      setTimeout(() => {
        setStep((prev) => Math.max(prev, 2));
        pwRef.current?.focus();
      }, 400);
    }, 800);
  };

  const handlePasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setPassword(filteredText);
  };

  const handleConfirmPasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setConfirmPassword(filteredText);
  };

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  const isFormValid = Boolean(isIdAvailable) && isPasswordMatch && !isSubmitting;

  const handleNextStep = () => {
    if (step === 2 && isPasswordValid) {
      setStep(3);
      setTimeout(() => confirmPwRef.current?.focus(), 150);
    }
  };

  /**
   * 화면에서 관리하는 상태를 실제 백엔드 DTO 형식으로 변환합니다.
   * 현재 앱 플로우상 직업 선택이 뒤에 있어 임시 jobId 를 사용합니다.
   */
  const handleCreateAccount = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const signupResponse = await signup({
        userId: id,
        jobId: TEMP_SIGNUP_JOB_ID,
        pw: password,
        name: routeParams.name ?? '',
        gender: buildGender(routeParams.ssnBack),
        phoneNumber: routeParams.phone ?? '',
        birthDate: buildBirthDate(routeParams.ssnFront, routeParams.ssnBack),
        alarmEnabled: true,
      });

      navigation.replace('Welcome', {
        ...routeParams,
        id: signupResponse.userId,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        '회원가입 중 문제가 발생했어요. 입력값을 다시 확인해주세요.';

      setSubmitError(message);
      Alert.alert('회원가입 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdChange = (text: string) => {
    setId(text);
    setSubmitError('');

    if (isIdAvailable !== null) {
      setIsIdAvailable(null);
    }
  };

  const getButtonState = () => {
    if (step === 1) {
      return { text: '다음', isActive: false, onPress: undefined as (() => void) | undefined };
    }

    if (step === 2) {
      return {
        text: '다음',
        isActive: isPasswordValid,
        onPress: handleNextStep,
      };
    }

    return {
      text: isSubmitting ? '회원가입 중...' : '계정 만들기',
      isActive: isFormValid,
      onPress: handleCreateAccount,
    };
  };

  const btnState = getButtonState();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + hp(60),
            paddingBottom: insets.bottom + hp(40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {step === 1
            ? '회원가입 아이디를\n입력해주세요.'
            : step === 2
              ? '비밀번호를\n입력해주세요.'
              : '비밀번호를\n한 번 더 입력해주세요.'}
        </Text>

        {/* 회원가입 API 에 실제로 userId 로 들어가는 값입니다. */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <View style={styles.idInputRow}>
            <View style={[styles.underlineContainer, { flex: 1 }]}>
              <TextInput
                ref={idRef}
                style={[styles.bareInput, { letterSpacing: id.length > 0 ? 1 : 0 }]}
                value={id}
                onChangeText={handleIdChange}
                placeholder="아이디 (4자 이상)"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={id.length >= 4 && isIdAvailable === null ? handleCheckId : undefined}
                editable={!isCheckingId && !isSubmitting}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.checkButton,
                id.length >= 4 ? styles.checkButtonActive : styles.checkButtonInactive,
                isIdAvailable === true && styles.checkButtonSuccess,
              ]}
              disabled={id.length < 4 || isCheckingId || isIdAvailable === true || isSubmitting}
              onPress={handleCheckId}
            >
              {isCheckingId ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : isIdAvailable === true ? (
                <Ionicons name="checkmark" size={wp(20)} color="#FFFFFF" />
              ) : (
                <Text style={styles.checkButtonText}>중복확인</Text>
              )}
            </TouchableOpacity>
          </View>

          {isIdAvailable === true && (
            <Animated.Text entering={FadeInDown.duration(300)} style={styles.successMessage}>
              사용할 수 있는 아이디예요.
            </Animated.Text>
          )}
          {isIdAvailable === false && (
            <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorMessage}>
              이미 사용 중인 아이디예요.
            </Animated.Text>
          )}
        </Animated.View>

        {step >= 2 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={[styles.underlineContainer, styles.passwordRow]}>
              <TextInput
                ref={pwRef}
                style={[styles.bareInput, { flex: 1, letterSpacing: password.length > 0 ? 4 : 0 }]}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isPwVisible}
                returnKeyType="next"
                onSubmitEditing={handleNextStep}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setIsPwVisible(!isPwVisible)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPwVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={wp(24)}
                  color={isPwVisible ? COLORS.primary : COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 8 && (
              <Text style={styles.guideMessage}>비밀번호는 8자 이상 입력해주세요.</Text>
            )}
          </Animated.View>
        )}

        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={[styles.underlineContainer, styles.passwordRow]}>
              <TextInput
                ref={confirmPwRef}
                style={[
                  styles.bareInput,
                  { flex: 1, letterSpacing: confirmPassword.length > 0 ? 4 : 0 },
                ]}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="비밀번호 확인"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isConfirmPwVisible}
                returnKeyType="done"
                onSubmitEditing={handleCreateAccount}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                onPress={() => setIsConfirmPwVisible(!isConfirmPwVisible)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isConfirmPwVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={wp(24)}
                  color={isConfirmPwVisible ? COLORS.primary : COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !isPasswordMatch && password.length >= 8 && (
              <Text style={styles.errorMessage}>비밀번호가 일치하지 않아요.</Text>
            )}
            {isPasswordMatch && (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.successMessage}>
                비밀번호가 일치해요.
              </Animated.Text>
            )}
          </Animated.View>
        )}

        {submitError.length > 0 && step >= 3 && (
          <Text style={styles.submitErrorText}>{submitError}</Text>
        )}
      </ScrollView>

      {step >= 2 && (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[styles.bottomContainer, { paddingBottom: insets.bottom || hp(24) }]}
        >
          <TouchableOpacity
            style={[styles.confirmButton, btnState.isActive && styles.activeButton]}
            disabled={!btnState.isActive}
            onPress={btnState.onPress}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.confirmButtonText, btnState.isActive && styles.activeButtonText]}>
                {btnState.text}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(40),
    marginBottom: hp(40),
    letterSpacing: -0.5,
  },
  inputSection: {
    marginBottom: hp(32),
  },
  idInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bareInput: {
    fontSize: fp(20),
    fontFamily: FONTS.semiBold,
    color: '#1A1A1A',
    padding: 0,
    margin: 0,
  },
  eyeIcon: {
    padding: wp(4),
  },
  checkButton: {
    paddingHorizontal: wp(16),
    height: hp(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(8),
    marginBottom: hp(4),
  },
  checkButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  checkButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  checkButtonSuccess: {
    backgroundColor: '#22C55E',
  },
  checkButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
  successMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#22C55E',
    marginTop: hp(8),
  },
  errorMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
    marginTop: hp(8),
  },
  guideMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: hp(8),
  },
  submitErrorText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
    marginTop: hp(4),
  },
  bottomContainer: {
    paddingHorizontal: wp(28),
    backgroundColor: '#FFFFFF',
    paddingTop: hp(12),
  },
  confirmButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});
