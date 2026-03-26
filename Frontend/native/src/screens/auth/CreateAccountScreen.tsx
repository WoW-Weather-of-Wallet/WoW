import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import AuthActionButton from '../../components/common/AuthActionButton';
import AuthUnderlineInput from '../../components/common/AuthUnderlineInput';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useCreateAccountStepFlow } from '../../hooks';
import type { RootScreenProps } from '../../types';
import type { CreateAccountRouteParams } from '../../types/auth';

const SCROLL_CONTENT_PADDING_TOP = hp(20);
const SCROLL_CONTENT_PADDING_BOTTOM = hp(40);
const BOTTOM_CONTAINER_PADDING_BOTTOM = hp(20);
const CHECK_BUTTON_ICON_SIZE = wp(20);
const EYE_ICON_SIZE = wp(22);

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
    handleCreateAccount,
    handleIdChange,
  } = useCreateAccountStepFlow(routeParams);

  return (
    <AuthStepLayout
      currentStep={stepIndicatorCurrentStep}
      totalSteps={5}
      title={title}
      description="가입에 사용할 아이디와 비밀번호를 입력해 주세요."
      scrollContentPaddingTop={SCROLL_CONTENT_PADDING_TOP}
      scrollContentPaddingBottom={SCROLL_CONTENT_PADDING_BOTTOM}
      bottomMinPadding={BOTTOM_CONTAINER_PADDING_BOTTOM}
      bottomContent={
        step >= 2 ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <AuthActionButton
              label={buttonState.text}
              loading={isSubmitting}
              disabled={!buttonState.isActive}
              active={buttonState.isActive}
              onPress={buttonState.onPress}
              containerStyle={{
                backgroundColor: COLORS.border,
                borderRadius: wp(30),
                paddingVertical: hp(16),
                alignItems: 'center',
              }}
              activeContainerStyle={{
                backgroundColor: COLORS.textPrimary,
              }}
              textStyle={{
                fontSize: fp(18),
                fontFamily: FONTS.bold,
                color: COLORS.textTertiary,
              }}
              activeTextStyle={{ color: COLORS.textInverse }}
              loadingColor={COLORS.textInverse}
            />
          </Animated.View>
        ) : null
      }
    >
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={{ marginBottom: hp(32) }}
      >
        <View
          className="flex-row items-end justify-between"
          style={{ gap: wp(12) }}
        >
          <AuthUnderlineInput
            ref={idRef}
            containerStyle={[
              {
                borderBottomWidth: 1.5,
                borderBottomColor: COLORS.textPrimary,
                paddingVertical: hp(8),
                minHeight: hp(50),
                justifyContent: 'center',
              },
              { flex: 1 },
            ]}
            inputStyle={[
              {
                fontSize: fp(20),
                fontFamily: FONTS.semiBold,
                color: COLORS.textPrimary,
                padding: 0,
                margin: 0,
              },
              id.length > 0 ? { letterSpacing: 1 } : null,
            ]}
            value={id}
            onChangeText={handleIdChange}
            placeholder="아이디 (4자 이상)"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={
              id.length >= 4 && isIdAvailable === null ? handleCheckId : undefined
            }
            editable={!isCheckingId && !isSubmitting}
            autoFocus
          />

          <TouchableOpacity
            className="items-center justify-center"
            style={{
              paddingHorizontal: wp(16),
              height: hp(44),
              borderRadius: RADIUS.sm,
              marginBottom: hp(4),
              backgroundColor:
                isIdAvailable === true
                  ? COLORS.success
                  : id.length >= 4
                    ? COLORS.textPrimary
                    : COLORS.backgroundSecondary,
            }}
            disabled={
              id.length < 4 ||
              isCheckingId ||
              isIdAvailable === true ||
              isSubmitting
            }
            onPress={() => void handleCheckId()}
          >
            {isCheckingId ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : isIdAvailable === true ? (
              <Ionicons
                name="checkmark"
                size={CHECK_BUTTON_ICON_SIZE}
                color={COLORS.textInverse}
              />
            ) : (
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textInverse,
                }}
              >
                중복 확인
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isIdAvailable === true ? (
          <Animated.Text
            entering={FadeInDown.duration(300)}
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.success,
              marginTop: hp(8),
            }}
          >
            사용할 수 있는 아이디예요.
          </Animated.Text>
        ) : null}

        {isIdAvailable === false && submitError.length === 0 ? (
          <Animated.Text
            entering={FadeInDown.duration(300)}
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.error,
              marginTop: hp(8),
            }}
          >
            이미 사용 중인 아이디예요.
          </Animated.Text>
        ) : null}

        {id.length === 0 ? (
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.textTertiary,
              marginTop: hp(8),
            }}
          >
            영문과 숫자를 조합한 아이디를 입력해 주세요.
          </Text>
        ) : null}
      </Animated.View>

      {step >= 2 ? (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{ marginBottom: hp(32) }}
        >
          <AuthUnderlineInput
            ref={pwRef}
            containerStyle={[
              {
                borderBottomWidth: 1.5,
                borderBottomColor: COLORS.textPrimary,
                paddingVertical: hp(8),
                minHeight: hp(50),
                justifyContent: 'center',
              },
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
            inputStyle={[
              {
                fontSize: fp(20),
                fontFamily: FONTS.semiBold,
                color: COLORS.textPrimary,
                padding: 0,
                margin: 0,
              },
              { flex: 1 },
              password.length > 0 ? { letterSpacing: 1 } : null,
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 (8자 이상)"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!isPasswordVisible}
            returnKeyType="next"
            editable={!isSubmitting}
            rightAccessory={
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={{ padding: wp(4) }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={EYE_ICON_SIZE}
                  color={
                    isPasswordVisible ? COLORS.primary : COLORS.textTertiary
                  }
                />
              </TouchableOpacity>
            }
          />

          {password.length > 0 && !isPasswordValid ? (
            <Animated.Text
              entering={FadeInDown.duration(300)}
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.error,
                marginTop: hp(8),
              }}
            >
              {passwordValidation.message}
            </Animated.Text>
          ) : null}

          <AuthUnderlineInput
            ref={confirmPwRef}
            containerStyle={[
              {
                borderBottomWidth: 1.5,
                borderBottomColor: COLORS.textPrimary,
                paddingVertical: hp(8),
                minHeight: hp(50),
                justifyContent: 'center',
              },
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              { marginTop: hp(24) },
            ]}
            inputStyle={[
              {
                fontSize: fp(20),
                fontFamily: FONTS.semiBold,
                color: COLORS.textPrimary,
                padding: 0,
                margin: 0,
              },
              { flex: 1 },
              confirmPassword.length > 0 ? { letterSpacing: 1 } : null,
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
            rightAccessory={
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={{ padding: wp(4) }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'
                  }
                  size={EYE_ICON_SIZE}
                  color={
                    isConfirmPasswordVisible
                      ? COLORS.primary
                      : COLORS.textTertiary
                  }
                />
              </TouchableOpacity>
            }
          />

          {canShowMismatch && !isPasswordMatch ? (
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.error,
                marginTop: hp(8),
              }}
            >
              비밀번호가 일치하지 않아요.
            </Text>
          ) : null}

          {isPasswordMatch ? (
            <Animated.Text
              entering={FadeInDown.duration(300)}
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.success,
                marginTop: hp(8),
              }}
            >
              비밀번호가 일치해요.
            </Animated.Text>
          ) : null}
        </Animated.View>
      ) : null}

      {submitError.length > 0 ? (
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.medium,
            color: COLORS.error,
            marginTop: hp(4),
          }}
        >
          {submitError}
        </Text>
      ) : null}
    </AuthStepLayout>
  );
}
