import React, { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import { styles, CONSTANTS } from './CreateAccountScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { checkUserId, signup, type NativeSignupRequest } from '../../services/auth';
import type { CreateAccountRouteParams } from '../../types/auth';
import { buildIdentityProfile } from '../../utils/authIdentity';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { validateId, validatePassword, validateName, validatePhone } from '../../utils/validation';

export default function CreateAccountScreen({ route, navigation }: any) {
  const routeParams = (route?.params ?? {}) as CreateAccountRouteParams;

  const [step, setStep] = useState(1);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 비밀번호 입력은 필요한 시점에만 노출해 읽기 흐름을 단순하게 유지합니다.
  const [isPwVisible, setIsPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  // 일반 회원가입에서는 아이디 중복확인을 먼저 통과해야 다음 단계로 이동합니다.
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

  const passwordValidation = validatePassword(password, id);
  const isPasswordValid = passwordValidation.isValid;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  const hasSignupIdentifier = Boolean(isIdAvailable);
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
    if (!trimmedUserId) {
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

    const identityProfile = buildIdentityProfile(
      routeParams.ssnFront,
      routeParams.ssnBack,
    );

    const signupPayload: NativeSignupRequest = {
      userId: trimmedUserId,
      pw: password,
      name: currentName.trim(),
      gender: identityProfile?.gender ?? 'M',
      phoneNumber: currentPhone.replace(/[^0-9]/g, ''),
      birthDate: identityProfile?.birthDate ?? '2000-01-01',
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
              name: signupPayload.name,
              userId: id,
              pw: signupPayload.pw,
              birthDate: signupPayload.birthDate,
              gender: signupPayload.gender,
              phoneNumber: signupPayload.phoneNumber,
              termsAgreed: signupPayload.termsAgreed,
              alarmEnabled: signupPayload.alarmEnabled,
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
    <AuthStepLayout
      currentStep={step === 1 ? 3 : 4}
      totalSteps={5}
      title={
        step === 1
          ? '회원가입 아이디를\n입력해주세요.'
          : step === 2
            ? '비밀번호를\n입력해주세요.'
            : '비밀번호를\n한 번 더 입력해주세요.'
      }
      description="이전 단계에서 필수 약관 전체 동의와 휴대폰 인증을 마친 상태예요."
      scrollContentPaddingTop={CONSTANTS.scrollContentPaddingTop}
      scrollContentPaddingBottom={CONSTANTS.scrollContentPaddingBottom}
      bottomMinPadding={CONSTANTS.bottomContainerPaddingBottom}
      bottomContent={
        step >= 2 ? (
          <Animated.View entering={FadeInDown.duration(500)}>
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
        ) : null
      }
    >

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

        {step >= 2 && (
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
    </AuthStepLayout>
  );
}
