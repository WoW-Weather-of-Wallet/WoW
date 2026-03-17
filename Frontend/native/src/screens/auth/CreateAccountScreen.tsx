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
import DevShortcutButton from '../../components/common/DevShortcutButton';
import StepIndicator from '../../components/common/StepIndicator';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { checkUserId, signup } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { validateId, validatePassword, validateName, validatePhone } from '../../utils/validation';

type CreateAccountRouteParams = {
  // 일반 회원가입/SSAFY 회원가입 공용 화면에서 분기 기준으로 사용
  signupMode?: 'normal' | 'ssafy';
  name?: string;
  phone?: string;
  ssnFront?: string;
  ssnBack?: string;
  termsAgreed?: boolean;
  ssafyOauthId?: string;
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
  const signupMode = routeParams.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';

  // 일반 회원가입은 아이디 입력부터 시작하고, SSAFY 회원가입은 비밀번호 설정 단계부터 시작한다.
  const [step, setStep] = useState(isSsafySignup ? 2 : 1);
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

  // 일반 회원가입의 아이디 중복확인 단계
  // GET /api/v1/auth/check-user-id 응답의 isAvailable 값을 기준으로 다음 단계 진입을 연다.
  const handleCheckId = async () => {
    const trimmedId = id.trim();

    // 1. 프론트엔드 단에서의 아이디 형식 검증 (중앙화된 유틸리티 사용)
    // 보안 정책에 따라 영문 소문자 + 숫자 조합, 4~20자, 영문 소문자 필수 여부를 확인합니다.
    const idValidation = validateId(trimmedId);
    if (!idValidation.isValid) {
      setSubmitError(idValidation.message);
      setIsIdAvailable(false);
      return;
    }

    if (isCheckingId || isSubmitting) {
      return;
    }

    setIsCheckingId(true);
    setSubmitError('');

    try {
      const response = await checkUserId(trimmedId);
      const isAvailable = response?.isAvailable === true;

      setIsIdAvailable(isAvailable);

      // 일반 회원가입에서만 아이디 확인 후 비밀번호 입력 단계로 넘긴다.
      if (isAvailable) {
        setTimeout(() => {
          setStep((prev) => Math.max(prev, 2));
          pwRef.current?.focus();
        }, 250);
        return;
      }

      // 중복 결과는 예외가 아니라 응답 메시지 기준으로 안내 문구만 보여준다.
      setSubmitError(response?.message ?? '이미 사용 중인 아이디예요.');
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        '아이디 중복확인에 실패했어요. 잠시 후 다시 시도해주세요.',
      );

      setIsIdAvailable(false);
      setSubmitError(message);
      Alert.alert('중복확인 실패', message);
    } finally {
      setIsCheckingId(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setPassword(filteredText);
  };

  const handleConfirmPasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setConfirmPassword(filteredText);
  };

  /**
   * 비밀번호(PW) 보안 검증: 중앙화된 validatePassword 유틸리티를 사용합니다.
   * 영문 대/소문자, 숫자, 특수문자 조합 및 연속성/반복성/아이디 대조 등을 모두 검사합니다.
   */
  const passwordValidation = validatePassword(password, signupMode === 'normal' ? id : undefined);
  const isPasswordValid = passwordValidation.isValid;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  const hasSignupIdentifier =
    isSsafySignup ? Boolean(routeParams.ssafyOauthId?.trim()) : Boolean(isIdAvailable);
  const isFormValid = hasSignupIdentifier && isPasswordMatch && !isSubmitting;

  const handleNextStep = () => {
    if (step === 2 && isPasswordValid) {
      setStep(3);
      setTimeout(() => confirmPwRef.current?.focus(), 150);
    }
  };

  /**
   * CreateAccount 화면의 최종 회원가입 처리
   * POST /api/v1/auth/signup 요청으로 일반 회원가입 또는 SSAFY 회원가입을 완료하고
   * 성공 시 Welcome 화면으로 이동해 최종 확인을 받는다.
   */
  const handleCreateAccount = async () => {
    if (!isFormValid) {
      return;
    }

    const trimmedUserId = id.trim();
    const ssafyOauthId = routeParams.ssafyOauthId?.trim();

    if (!trimmedUserId && !ssafyOauthId) {
      setSubmitError('회원가입 식별 정보가 없어 다시 로그인부터 진행해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const currentName = routeParams.name ?? '';
    const currentPhone = routeParams.phone ?? '';

    /**
     * [Defense-Log] 백엔드 요청값 검증(P2) 부재에 대응
     * 가입 단계에서 이름과 전화번호가 올바른 형식인지 최종적으로 한 번 더 검사합니다.
     */
    const nameValidation = validateName(currentName);
    if (!nameValidation.isValid) {
      setSubmitError(nameValidation.message);
      setIsSubmitting(false);
      return;
    }

    const phoneValidation = validatePhone(currentPhone);
    if (!phoneValidation.isValid) {
      setSubmitError(phoneValidation.message);
      setIsSubmitting(false);
      return;
    }

    const signupPayload = {
      userId: isSsafySignup ? undefined : trimmedUserId,
      ssafyOauthId: isSsafySignup ? ssafyOauthId : undefined,
      pw: password,
      name: currentName.trim(),
      gender: buildGender(routeParams.ssnBack),
      phoneNumber: currentPhone.replace(/[^0-9]/g, ''),
      birthDate: buildBirthDate(routeParams.ssnFront, routeParams.ssnBack),
      alarmEnabled: true,
      termsAgreed: routeParams.termsAgreed === true,
    };

    // 회원가입 요청 본문 확인용 로그
    console.log('[signup payload]', JSON.stringify(signupPayload));

    try {
      await signup(signupPayload);
      // Welcome 화면에서 가입 정보 확인과 일반 회원 자동로그인 처리를 이어간다.
      navigation.replace('Welcome', {
        ...routeParams,
        signupMode,
        userId: signupPayload.userId,
        ssafyOauthId: signupPayload.ssafyOauthId,
        pw: signupPayload.pw,
        name: signupPayload.name,
        birthDate: signupPayload.birthDate,
        gender: signupPayload.gender,
        phoneNumber: signupPayload.phoneNumber,
        termsAgreed: signupPayload.termsAgreed,
        alarmEnabled: signupPayload.alarmEnabled,
      });
      return;
    } catch (error: any) {
      const debugMessage = [
        error?.response?.status ? `status: ${error.response.status}` : 'status: unknown',
        error?.code ? `code: ${error.code}` : 'code: none',
        error?.message ? `message: ${error.message}` : 'message: none',
      ].join(' / ');

      console.error('[signup catch status]', error?.response?.status);
      console.error('[signup catch data]', error?.response?.data);
      console.error('[signup catch message]', error?.message);

      // 회원가입 실패 시 auth 공통 에러 파서를 통해 화면 문구를 정리한다.
      const message = extractApiErrorMessage(error, debugMessage);

      setSubmitError(message);
      Alert.alert('회원가입 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleIdChange = (text: string) => {
    setId(text);
    setSubmitError('');

    // 아이디 입력값이 바뀌면 이전 중복확인 결과는 더 이상 신뢰할 수 없으므로 초기화합니다.
    if (isIdAvailable !== null) {
      setIsIdAvailable(null);
    }
  };

  const getButtonState = () => {
    // 일반 회원가입은 아이디 단계 -> 비밀번호 단계 -> 확인 단계 순서로 이동한다.
    if (!isSsafySignup && step === 1) {
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
        <StepIndicator
          currentStep={isSsafySignup ? 3 : (step === 1 ? 2 : 3)}
          totalSteps={4}
        />

        <Text style={styles.title}>
          {isSsafySignup
            ? '비밀번호를\n입력해주세요.'
            : step === 1
            ? '회원가입 아이디를\n입력해주세요.'
            : step === 2
              ? '비밀번호를\n입력해주세요.'
              : '비밀번호를\n한 번 더 입력해주세요.'}
        </Text>


        {/* 일반 회원가입에서만 userId 입력 및 중복확인 UI를 보여준다. */}
        {!isSsafySignup && (
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
            {isIdAvailable === false && submitError.length === 0 && (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorMessage}>
                이미 사용 중인 아이디예요.
              </Animated.Text>
            )}
          </Animated.View>
        )}

        {/* SSAFY 회원가입에서는 콜백으로 받은 이름을 읽기 전용으로 노출한다. */}
        {isSsafySignup && routeParams.name ? (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <Text style={styles.fixedLabel}>이름</Text>
            <View style={styles.fixedValueBox}>
              <Text style={styles.fixedValueText}>{routeParams.name}</Text>
              <Text style={styles.fixedHintText}>SSAFY 계정에서 가져온 이름이라 수정할 수 없어요.</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* 비밀번호 설정 단계: 일반/SSAFY 회원가입 모두 공통으로 사용한다. */}
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
            {/* 비밀번호 정책 위반 시 상세 안내 문구 표시 (복잡성, 연속성, 반복성 등) */}
            {password.length > 0 && !isPasswordValid && (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorMessage}>
                {passwordValidation.message}
              </Animated.Text>
            )}
          </Animated.View>
        )}

        {/* 비밀번호 확인 단계: 최종 회원가입 직전 검증용 입력 영역 */}
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

        {submitError.length > 0 && <Text style={styles.submitErrorText}>{submitError}</Text>}

        {/* [Defense-Log] 운영 환경 전환을 위해 하드코딩된 인증 우회 버튼(DevShortcutButton)을 제거했습니다. */}
      </ScrollView>

      {step >= 2 && (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}
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
  fixedLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginBottom: hp(10),
  },
  fixedValueBox: {
    borderRadius: wp(16),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: wp(18),
    paddingVertical: hp(16),
    gap: hp(8),
  },
  fixedValueText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  fixedHintText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
