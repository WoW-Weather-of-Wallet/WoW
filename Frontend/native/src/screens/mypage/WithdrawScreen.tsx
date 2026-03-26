import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../../components/common/StepIndicator';
import AuthActionButton from '../../components/common/AuthActionButton';
import IdentityStepFormLayout from '../../components/common/IdentityStepFormLayout';
import IdentityNameSection from '../../components/common/IdentityNameSection';
import IdentitySsnSection from '../../components/common/IdentitySsnSection';
import TelecomPhoneInputSection from '../../components/common/TelecomPhoneInputSection';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import { styles } from './WithdrawScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import {
  PHONE_NUMBER_PLACEHOLDER,
  SEND_CODE_LABEL,
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
              회원 탈퇴 전{'\n'}본인 확인을 진행해 주세요.
            </>
          }
          subtitle={
            <>
              회원 정보와 일치하는 내용을{'\n'}입력해야 인증번호를 받을 수 있어요.
            </>
          }
          onBack={() => navigation.goBack()}
          bottomContent={
            <AuthActionButton
              label={SEND_CODE_LABEL}
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
            <IdentityNameSection
              value={name}
              containerStyle={styles.underlineContainer}
              valueStyle={[
                styles.bareInput,
                { letterSpacing: name.length > 0 ? 2 : 0 },
              ]}
              placeholderTextColor={COLORS.textTertiary}
              onChangeText={(value) => {
                setName(value);
                setSubmitError('');
              }}
              inputProps={{ returnKeyType: 'next' }}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(400)}>
            <IdentitySsnSection
              frontValue={ssnFront}
              backValue={ssnBack}
              onFrontChange={(text) => {
                setSsnFront(text.replace(/[^0-9]/g, ''));
                setSubmitError('');
              }}
              onBackChange={(text) => {
                setSsnBack(text.replace(/[^0-9]/g, ''));
                setSubmitError('');
              }}
              containerStyle={styles.ssnSection}
              frontContainerStyle={[
                styles.underlineContainer,
                { flex: 1.1, justifyContent: 'center' },
              ]}
              frontValueStyle={[
                styles.bareInput,
                {
                  textAlign: 'center',
                  letterSpacing: ssnFront.length > 0 ? 4 : 0,
                },
              ]}
              backContainerStyle={[
                styles.underlineContainer,
                styles.ssnBackContainer,
              ]}
              backValueStyle={[
                styles.bareInput,
                styles.ssnBackInput,
                { letterSpacing: ssnBack.length > 0 ? 4 : 0 },
              ]}
              dashStyle={styles.dash}
              maskingTextStyle={styles.ssnMasking}
              placeholderTextColor={COLORS.textTertiary}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(400)}
            style={styles.inputSection}
          >
            <TelecomPhoneInputSection
              telecom={telecom}
              telecomPlaceholder={TELECOM_PLACEHOLDER}
              phone={phone}
              onOpenTelecomModal={() => setIsTelecomModalVisible(true)}
              onPhoneChange={(text) => {
                setPhone(text.replace(/[^0-9]/g, ''));
                setSubmitError('');
              }}
              phonePlaceholder={PHONE_NUMBER_PLACEHOLDER}
              selectorStyle={styles.telecomSelector}
              telecomTextStyle={styles.telecomText}
              placeholderTextStyle={styles.placeholderText}
              phoneInputContainerStyle={[
                styles.underlineContainer,
                { marginTop: hp(32) },
              ]}
              phoneInputStyle={[
                styles.bareInput,
                { letterSpacing: phone.length > 0 ? 2 : 0 },
              ]}
              errorTextStyle={styles.errorText}
              errorText={submitError}
              chevronIconSize={wp(24)}
              chevronIconColor={COLORS.textPrimary}
              placeholderTextColor={COLORS.textTertiary}
            />
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
              탈퇴 후에는 계정 정보와 금융 데이터 일부가 삭제되며 복구할 수 없어요.
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
          ? '본인 확인이\n완료되었어요.'
          : '인증번호 6자리를\n입력해 주세요.'
      }
      subtitle={`${requestedPhoneDisplay} 번호로 전송된 인증번호를 입력해 주세요.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage="본인 확인 완료! 탈퇴를 진행할 수 있어요."
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
              <Text style={styles.withdrawButtonText}>회원 탈퇴</Text>
            )}
          </TouchableOpacity>
        </View>
      }
    />
  );
}
