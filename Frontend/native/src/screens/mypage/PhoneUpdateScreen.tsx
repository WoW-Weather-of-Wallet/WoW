import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StepIndicator from '../../components/common/StepIndicator';
import AuthActionButton from '../../components/common/AuthActionButton';
import IdentityStepFormLayout from '../../components/common/IdentityStepFormLayout';
import TelecomPhoneInputSection from '../../components/common/TelecomPhoneInputSection';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import { styles } from './PhoneUpdateScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import {
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
  VERIFICATION_CODE_LENGTH,
} from '../../constants/auth/identityVerification';
import { usePhoneUpdateFlow } from '../../hooks';
import type { MyPageStackScreenProps } from '../../types';

export default function PhoneUpdateScreen({
  navigation,
  route,
}: MyPageStackScreenProps<'PhoneUpdate'>) {
  const insets = useSafeAreaInsets();
  const rawPhone: string = route.params?.phoneNumber ?? '';
  const profileName: string = route.params?.name ?? '';
  const profileBirthDate: string = route.params?.birthDate ?? '';
  const profileGender: string = route.params?.gender ?? '';
  const {
    expectedSsnFront,
    expectedSsnBack,
    telecom,
    phone,
    submitError,
    isTelecomModalVisible,
    isUpdating,
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
    setPhone,
    setSubmitError,
    setIsTelecomModalVisible,
    handleSelectTelecom,
    handleSendCode,
    handleUpdatePhone,
  } = usePhoneUpdateFlow({
    navigation,
    rawPhone,
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
          title="새 휴대폰 번호를 입력해주세요."
          subtitle="통신사 선택 후, 새로운 번호로 본인 인증을 진행합니다."
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
              <Text
                style={[
                  styles.bareText,
                  { letterSpacing: profileName ? 2 : 0 },
                ]}
              >
                {profileName || '-'}
              </Text>
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
              <Text
                style={[
                  styles.bareText,
                  {
                    textAlign: 'center',
                    letterSpacing: expectedSsnFront ? 4 : 0,
                  },
                ]}
              >
                {expectedSsnFront || 'YYMMDD'}
              </Text>
            </View>
            <Text style={styles.dash}>-</Text>
            <View style={[styles.underlineContainer, styles.ssnBackContainer]}>
              <Text style={[styles.bareText, styles.ssnBackText]}>
                {expectedSsnBack || '0'}
              </Text>
              <Text style={styles.ssnMasking}>******</Text>
            </View>
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
              phonePlaceholder="새 휴대폰 번호 (- 없이 입력)"
              selectorStyle={styles.telecomSelector}
              telecomTextStyle={styles.telecomText}
              placeholderTextStyle={styles.placeholderText}
              phoneInputContainerStyle={[styles.underlineContainer, { marginTop: hp(32) }]}
              phoneInputStyle={[
                styles.bareInput,
                { letterSpacing: phone.length > 0 ? 2 : 0 },
              ]}
              errorTextStyle={styles.errorText}
              errorText={submitError}
              phoneVisible={telecom !== TELECOM_PLACEHOLDER}
              animatePhoneInput
              chevronIconSize={wp(24)}
              chevronIconColor={COLORS.textPrimary}
              placeholderTextColor={COLORS.textTertiary}
            />
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
          ? '휴대폰 번호 인증이\n완료되었어요.'
          : '인증번호 6자리를\n입력해주세요.'
      }
      subtitle={`${requestedPhoneDisplay}로 전송된 인증번호를 입력해주세요.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage="인증 완료! 휴대폰 번호를 변경할 수 있어요."
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
            style={[styles.updateButton, isUpdating && styles.disabledButton]}
            disabled={isUpdating}
            onPress={() => void handleUpdatePhone()}
          >
            {isUpdating ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.updateButtonText}>휴대폰 번호 변경</Text>
            )}
          </TouchableOpacity>
        </View>
      }
    />
  );
}
