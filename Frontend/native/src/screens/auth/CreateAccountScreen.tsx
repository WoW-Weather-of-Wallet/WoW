import React, { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import { styles, CONSTANTS } from './CreateAccountScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { useCreateAccountFlow } from '../../hooks';
import type { CreateAccountRouteParams } from '../../types/auth';
import type { RootScreenProps } from '../../types';
import { validatePassword } from '../../utils/validation';

export default function CreateAccountScreen({
  route,
}: RootScreenProps<'CreateAccount'>) {
  const routeParams = (route?.params ?? {}) as CreateAccountRouteParams;

  const [step, setStep] = useState(1);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPwVisible, setIsPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  const {
    isCheckingId,
    isIdAvailable,
    isSubmitting,
    submitError,
    clearSubmitError,
    resetIdAvailability,
    handleCheckId: submitIdCheck,
    handleCreateAccount: submitCreateAccount,
  } = useCreateAccountFlow(routeParams);

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  const handleCheckId = async () => {
    const isAvailable = await submitIdCheck(id);

    if (isAvailable) {
      setTimeout(() => {
        setStep((prev) => Math.max(prev, 2));
        pwRef.current?.focus();
      }, 250);
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

    await submitCreateAccount({
      userId: id,
      password,
    });
  };

  const handleIdChange = (text: string) => {
    setId(text);
    clearSubmitError();
    if (isIdAvailable !== null) {
      resetIdAvailability();
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
      text: isSubmitting ? '회원가입 중...' : '계정 생성하기',
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
          ? '회원가입 아이디를\n입력해 주세요.'
          : step === 2
            ? '비밀번호를\n입력해 주세요.'
            : '비밀번호를\n한 번 더 입력해 주세요.'
      }
      description="입력한 정보는 안전하게 보호되며 가입 완료 후 본인 계정으로 사용할 수 있어요."
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
            onPress={() => void handleCheckId()}
          >
            {isCheckingId ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : isIdAvailable === true ? (
              <Ionicons name="checkmark" size={CONSTANTS.checkButtonIconSize} color={COLORS.textInverse} />
            ) : (
              <Text style={styles.checkButtonText}>중복 확인</Text>
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
          <Text style={styles.guideMessage}>영문과 숫자를 조합해 아이디를 만들어 주세요.</Text>
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
              onSubmitEditing={() => void handleCreateAccount()}
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
