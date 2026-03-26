import React from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import AuthActionButton from '../../components/common/AuthActionButton';
import { styles, CONSTANTS } from './CreateAccountScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { useCreateAccountStepFlow } from '../../hooks';
import type { CreateAccountRouteParams } from '../../types/auth';
import type { RootScreenProps } from '../../types';

export default function CreateAccountScreen({
  route,
}: RootScreenProps<'CreateAccount'>) {
  const routeParams: CreateAccountRouteParams = route.params ?? {};
  const {
    step,
    id,
    password,
    confirmPassword,
    isCheckingId,
    isIdAvailable,
    isSubmitting,
    isPasswordVisible,
    isConfirmPasswordVisible,
    submitError,
    passwordValidation,
    isPasswordValid,
    isPasswordMatch,
    canShowMismatch,
    title,
    stepIndicatorCurrentStep,
    buttonState,
    idRef,
    pwRef,
    confirmPwRef,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleCheckId,
    handleNextStep,
    handleCreateAccount,
    handleIdChange,
  } = useCreateAccountStepFlow(routeParams);

  return (
    <AuthStepLayout
      currentStep={stepIndicatorCurrentStep}
      totalSteps={5}
      title={title}
      description="입력한 정보는 안전하게 보호되며 회원가입 계정으로 사용할 수 있어요."
      scrollContentPaddingTop={CONSTANTS.scrollContentPaddingTop}
      scrollContentPaddingBottom={CONSTANTS.scrollContentPaddingBottom}
      bottomMinPadding={CONSTANTS.bottomContainerPaddingBottom}
      bottomContent={
        step >= 2 ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <AuthActionButton
              label={buttonState.text}
              loading={isSubmitting}
              disabled={!buttonState.isActive}
              active={buttonState.isActive}
              onPress={buttonState.onPress}
              containerStyle={styles.confirmButton}
              activeContainerStyle={styles.activeButton}
              textStyle={styles.confirmButtonText}
              activeTextStyle={styles.activeButtonText}
              loadingColor={COLORS.textInverse}
            />
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
              onChangeText={setPassword}
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!isPasswordVisible}
              returnKeyType="next"
              onSubmitEditing={handleNextStep}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={CONSTANTS.eyeIconSize}
                color={isPasswordVisible ? COLORS.primary : COLORS.textTertiary}
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
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 확인"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!isConfirmPasswordVisible}
              returnKeyType="done"
              onSubmitEditing={() => void handleCreateAccount()}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              onPress={toggleConfirmPasswordVisibility}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={CONSTANTS.eyeIconSize}
                color={isConfirmPasswordVisible ? COLORS.primary : COLORS.textTertiary}
              />
            </TouchableOpacity>
          </View>
          {canShowMismatch && !isPasswordMatch && (
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
