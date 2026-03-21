import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { CommonActions } from '@react-navigation/native';
import StepIndicator from '../../components/common/StepIndicator';
import { styles, CONSTANTS } from './CreateAccountScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { checkUserId, signup, type NativeSignupRequest } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
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
 */
const buildBirthDate = (ssnFront?: string, ssnBack?: string) => {
  if (!ssnFront || ssnFront.length !== 6 || !ssnBack) {
    return '2000-01-01';
  }

  // [UX-Refinement] 주민등록번호 뒷자리 첫 숫자에 따른 연도 접두사 판별 (외국인 및 1800년대생 포함)
  // 1, 2, 5, 6: 1900년대 (5, 6은 외국인)
  // 3, 4, 7, 8: 2000년대 (7, 8은 외국인)
  // 9, 0: 1800년대
  let yearPrefix = '19';
  if (['3', '4', '7', '8'].includes(ssnBack)) {
    yearPrefix = '20';
  } else if (['9', '0'].includes(ssnBack)) {
    yearPrefix = '18';
  }

  const year = `${yearPrefix}${ssnFront.slice(0, 2)}`;
  const month = ssnFront.slice(2, 4);
  const day = ssnFront.slice(4, 6);

  return `${year}-${month}-${day}`;
};

/**
 * 주민등록번호 뒷자리 첫 숫자를 성별 값으로 변환합니다.
 */
const buildGender = (ssnBack?: string) => {
  if (!ssnBack) {
    return 'M';
  }

  // 홀수면 남성, 짝수면 여성 (한국 주민등록번호 표준 규칙)
  const isOdd = parseInt(ssnBack, 10) % 2 !== 0;
  return isOdd ? 'M' : 'F';
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
  const handleCheckId = async () => {
    const trimmedId = id.trim();
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

      if (isAvailable) {
        setTimeout(() => {
          setStep((prev) => Math.max(prev, 2));
          pwRef.current?.focus();
        }, 250);
        return;
      }
      setSubmitError(response?.message ?? '이미 사용 중인 아이디에요.');
    } catch (error: any) {
      const message = extractApiErrorMessage(error, '아이디 중복확인에 실패했어요.');
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

  const passwordValidation = validatePassword(password, signupMode === 'normal' ? id : undefined);
  const isPasswordValid = passwordValidation.isValid;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  const hasSignupIdentifier = isSsafySignup ? Boolean(routeParams.ssafyOauthId?.trim()) : Boolean(isIdAvailable);
  const isFormValid = hasSignupIdentifier && isPasswordMatch && !isSubmitting;

  const handleNextStep = () => {
    if (step === 2 && isPasswordValid) {
      setStep(3);
      setTimeout(() => confirmPwRef.current?.focus(), 150);
    }
  };

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

    const signupPayload: NativeSignupRequest = {
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

    try {
      await signup(signupPayload);
      navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{
              name: 'Welcome',
              params: {
                signupMode,
                name: signupPayload.name,
                userId: id,
                pw: signupPayload.pw,
                birthDate: signupPayload.birthDate,
                gender: signupPayload.gender,
                phoneNumber: signupPayload.phoneNumber,
                termsAgreed: signupPayload.termsAgreed,
                alarmEnabled: signupPayload.alarmEnabled,
                ssafyOauthId: signupPayload.ssafyOauthId,
              },
            }],
          }),
      );
    } catch (error: any) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'signup',
        fallbackMessage: '회원가입 처리 중 문제가 발생했어요.',
      });
      setSubmitError(presentation.inlineMessage);
      Alert.alert(presentation.title, presentation.alertMessage);
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
            paddingTop: insets.top + CONSTANTS.scrollContentPaddingTop,
            paddingBottom: insets.bottom + CONSTANTS.scrollContentPaddingBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator
          currentStep={isSsafySignup ? (step === 1 ? 3 : 4) : (step === 1 ? 3 : 4)}
          totalSteps={5}
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

        {!isSsafySignup && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={styles.idInputRow}>
              <View style={[styles.underlineContainer, styles.idInputUnderline]}>
                <TextInput
                  ref={idRef}
                  style={[styles.bareInput, id.length > 0 && styles.bareInputLetterSpacing]}
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
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : isIdAvailable === true ? (
                  <Ionicons name="checkmark" size={CONSTANTS.checkButtonIconSize} color={COLORS.textInverse} />
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
            {id.length === 0 && (
              <Text style={styles.guideMessage}>영문 소문자, 숫자를 조합해주세요.</Text>
            )}
          </Animated.View>
        )}

        {(isSsafySignup || step >= 2) && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={[styles.underlineContainer, styles.passwordRow]}>
              <TextInput
                ref={pwRef}
                style={[styles.bareInput, styles.passwordInput, password.length > 0 && styles.bareInputLetterSpacing]}
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
                  size={CONSTANTS.eyeIconSize}
                  color={isPwVisible ? COLORS.primary : COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && !isPasswordValid && (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorMessage}>
                {passwordValidation.message}
              </Animated.Text>
            )}

            <View style={[styles.underlineContainer, styles.passwordRow, { marginTop: hp(24) }]}>
              <TextInput
                ref={confirmPwRef}
                style={[
                  styles.bareInput,
                  styles.passwordInput,
                  confirmPassword.length > 0 && styles.bareInputLetterSpacing,
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
                  size={CONSTANTS.eyeIconSize}
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
      </ScrollView>

      {step >= 2 && (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, CONSTANTS.bottomContainerPaddingBottom) }]}
        >
          <TouchableOpacity
            style={[styles.confirmButton, btnState.isActive && styles.activeButton]}
            disabled={!btnState.isActive}
            onPress={btnState.onPress}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.textInverse} />
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
