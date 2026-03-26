import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../../components/common/StepIndicator';
import AuthActionButton from '../../components/common/AuthActionButton';
import IdentityStepFormLayout from '../../components/common/IdentityStepFormLayout';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import { styles } from './WithdrawScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import {
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
  VERIFICATION_CODE_LENGTH,
} from '../../constants/auth/identityVerification';
import { useWithdrawFlow } from '../../hooks';
import type { MyPageStackScreenProps } from '../../types';

export default function WithdrawScreen({
  navigation,
  route,
}: MyPageStackScreenProps<'Withdraw'>) {
  const insets = useSafeAreaInsets();
  const rawPhone: string = route.params?.phoneNumber ?? '';
  const profileName: string = route.params?.name ?? '';
  const profileBirthDate: string = route.params?.birthDate ?? '';
  const profileGender: string = route.params?.gender ?? '';
  const {
    expectedSsnFront,
    expectedSsnBack,
    name,
    ssnFront,
    ssnBack,
    telecom,
    phone,
    isTelecomModalVisible,
    submitError,
    isDeleting,
    isButtonActive,
    phase,
    code,
    verifyError,
    requestedPhoneDisplay,
    isSending,
    isVerifying,
    isVerified,
    handlePressNumber,
    handlePressDelete,
    resendCode,
    backToForm,
    setName,
    setSsnFront,
    setSsnBack,
    setPhone,
    setSubmitError,
    setIsTelecomModalVisible,
    handleSelectTelecom,
    handleSendCode,
    handleWithdraw,
  } = useWithdrawFlow({
    navigation,
    rawPhone,
    profileName,
    profileBirthDate,
    profileGender,
  });

  if (phase === 'form') {
    return (
      <>
        <IdentityStepFormLayout
          containerStyle={styles.container}
          scrollContentStyle={styles.scrollContent}
          backButtonStyle={styles.backButton}
          stepIndicatorContainerStyle={{ marginTop: 0, marginBottom: hp(12) }}
          titleStyle={styles.title}
          subtitleStyle={styles.formSubtitle}
          bottomContainerStyle={styles.bottomContainer}
          title={
            <>
              회원 탈퇴 전{'\n'}본인 인증을 진행해주세요.
            </>
          }
          subtitle={
            <>
              회원 정보를 다시 확인한 뒤{'\n'}인증번호를 발송해드릴게요.
            </>
          }
          onBack={() => navigation.goBack()}
          bottomContent={
            <AuthActionButton
              label="인증번호 발송"
              loading={isSending}
              disabled={!isButtonActive}
              active={isButtonActive}
              onPress={() => void handleSendCode()}
              containerStyle={styles.confirmButton}
              activeContainerStyle={styles.activeButton}
              textStyle={styles.confirmButtonText}
              activeTextStyle={styles.activeButtonText}
              loadingColor={COLORS.textInverse}
            />
          }
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.inputSection}
          >
            <View style={styles.underlineContainer}>
              <TextInput
                style={[
                  styles.bareInput,
                  { letterSpacing: name.length > 0 ? 2 : 0 },
                ]}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setSubmitError('');
                }}
                placeholder="이름"
                placeholderTextColor={COLORS.textTertiary}
                returnKeyType="next"
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(160).duration(400)}
            style={styles.ssnSection}
          >
            <View
              style={[
                styles.underlineContainer,
                { flex: 1.1, justifyContent: 'center' },
              ]}
            >
              <TextInput
                style={[
                  styles.bareInput,
                  {
                    textAlign: 'center',
                    letterSpacing: ssnFront.length > 0 ? 4 : 0,
                  },
                ]}
                value={ssnFront}
                onChangeText={(text) => {
                  setSsnFront(text.replace(/[^0-9]/g, ''));
                  setSubmitError('');
                }}
                placeholder="YYMMDD"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <Text style={styles.dash}>-</Text>
            <View style={[styles.underlineContainer, styles.ssnBackContainer]}>
              <TextInput
                style={[
                  styles.bareInput,
                  styles.ssnBackInput,
                  { letterSpacing: ssnBack.length > 0 ? 4 : 0 },
                ]}
                value={ssnBack}
                onChangeText={(text) => {
                  setSsnBack(text.replace(/[^0-9]/g, ''));
                  setSubmitError('');
                }}
                keyboardType="number-pad"
                maxLength={1}
              />
              <Text style={styles.ssnMasking}>******</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(400)}
            style={styles.inputSection}
          >
            <TouchableOpacity
              style={styles.telecomSelector}
              onPress={() => setIsTelecomModalVisible(true)}
            >
              <Text
                style={[
                  styles.telecomText,
                  telecom === TELECOM_PLACEHOLDER && styles.placeholderText,
                ]}
              >
                {telecom}
              </Text>
              <Ionicons
                name="chevron-down"
                size={wp(24)}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
              <TextInput
                style={[
                  styles.bareInput,
                  { letterSpacing: phone.length > 0 ? 2 : 0 },
                ]}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  setSubmitError('');
                }}
                placeholder="휴대폰 번호 (- 없이 입력)"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            {submitError.length > 0 ? (
              <Text style={styles.errorText}>{submitError}</Text>
            ) : null}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.warningBox}
          >
            <Ionicons
              name="warning-outline"
              size={wp(18)}
              color={COLORS.error}
            />
            <Text style={styles.warningText}>
              탈퇴 후 계정 정보와 서비스 이용 내역은 복구되지 않습니다.
            </Text>
          </Animated.View>
        </IdentityStepFormLayout>

        <TelecomSelectModal
          visible={isTelecomModalVisible}
          onClose={() => setIsTelecomModalVisible(false)}
          onSelect={handleSelectTelecom}
          options={TELECOM_OPTIONS}
          bottomInset={insets.bottom}
          overlayStyle={styles.modalOverlay}
          contentStyle={styles.modalContent}
          headerStyle={styles.modalHeader}
          titleStyle={styles.modalTitle}
          itemStyle={styles.modalItem}
          itemTextStyle={styles.modalItemText}
        />
      </>
    );
  }

  return (
    <VerificationCodeStep
      containerStyle={styles.container}
      contentStyle={[styles.verifyContent, { paddingTop: insets.top + hp(28) }]}
      backButtonStyle={styles.backButton}
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
      dotsContainerStyle={styles.dotsContainer}
      dotStyle={styles.dot}
      dotFilledStyle={styles.dotFilled}
      feedbackRowStyle={styles.feedbackRow}
      loadingTextStyle={styles.loadingText}
      errorTextStyle={styles.errorText}
      successTextStyle={styles.successText}
      resendRowStyle={styles.resendRow}
      resendTextStyle={styles.resendText}
      keypadWrapperStyle={[
        styles.keypadWrapper,
        { paddingBottom: Math.max(insets.bottom, hp(24)) },
      ]}
      onBack={backToForm}
      backIconSize={wp(24)}
      backIconColor={COLORS.textPrimary}
      loadingIndicatorColor={COLORS.primary}
      successIconColor={COLORS.success}
      stepIndicator={
        <View style={{ marginTop: 0, marginBottom: hp(12) }}>
          <StepIndicator currentStep={2} totalSteps={2} compact />
        </View>
      }
      title={
        isVerified
          ? '본인 인증이\n완료되었어요.'
          : '인증번호 6자리를\n입력해주세요.'
      }
      subtitle={`${requestedPhoneDisplay}로 전송된 인증번호를 입력해주세요.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage="본인 인증 완료! 탈퇴를 진행할 수 있어요."
      isSending={isSending}
      onResend={() => void resendCode()}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      bottomAction={
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: Math.max(insets.bottom, hp(24)) },
          ]}
        >
          <TouchableOpacity
            style={[styles.withdrawButton, isDeleting && styles.disabledButton]}
            disabled={isDeleting}
            onPress={() => void handleWithdraw()}
          >
            {isDeleting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.withdrawButtonText}>탈퇴하기</Text>
            )}
          </TouchableOpacity>
        </View>
      }
    />
  );
}
