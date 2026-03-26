import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import IdentityVerificationFormStage from '../../components/common/IdentityVerificationFormStage';
import IdentityVerificationCodeStage from '../../components/common/IdentityVerificationCodeStage';
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
      <IdentityVerificationFormStage
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
        actionLabel={SEND_CODE_LABEL}
        actionLoading={isSending}
        actionDisabled={!isButtonActive}
        actionActive={isButtonActive}
        onActionPress={() => void handleSendCode()}
        actionContainerStyle={styles.confirmButton}
        actionActiveContainerStyle={styles.activeButton}
        actionTextStyle={styles.confirmButtonText}
        actionActiveTextStyle={styles.activeButtonText}
        actionLoadingColor={COLORS.textInverse}
        fields={{
          nameWrapperStyle: styles.inputSection,
          phoneWrapperStyle: styles.inputSection,
          nameDelay: 100,
          ssnDelay: 160,
          phoneDelay: 220,
          duration: 400,
          nameSection: {
            value: name,
            containerStyle: styles.underlineContainer,
            valueStyle: [
              styles.bareInput,
              { letterSpacing: name.length > 0 ? 2 : 0 },
            ],
            placeholderTextColor: COLORS.textTertiary,
            onChangeText: (value) => {
              setName(value);
              setSubmitError('');
            },
            inputProps: { returnKeyType: 'next' },
          },
          ssnSection: {
            frontValue: ssnFront,
            backValue: ssnBack,
            onFrontChange: (text) => {
              setSsnFront(text.replace(/[^0-9]/g, ''));
              setSubmitError('');
            },
            onBackChange: (text) => {
              setSsnBack(text.replace(/[^0-9]/g, ''));
              setSubmitError('');
            },
            containerStyle: styles.ssnSection,
            frontContainerStyle: [
              styles.underlineContainer,
              { flex: 1.1, justifyContent: 'center' },
            ],
            frontValueStyle: [
              styles.bareInput,
              {
                textAlign: 'center',
                letterSpacing: ssnFront.length > 0 ? 4 : 0,
              },
            ],
            backContainerStyle: [
              styles.underlineContainer,
              styles.ssnBackContainer,
            ],
            backValueStyle: [
              styles.bareInput,
              styles.ssnBackInput,
              { letterSpacing: ssnBack.length > 0 ? 4 : 0 },
            ],
            dashStyle: styles.dash,
            maskingTextStyle: styles.ssnMasking,
            placeholderTextColor: COLORS.textTertiary,
          },
          phoneSection: {
            telecom,
            telecomPlaceholder: TELECOM_PLACEHOLDER,
            phone,
            onOpenTelecomModal: () => setIsTelecomModalVisible(true),
            onPhoneChange: (text) => {
              setPhone(text.replace(/[^0-9]/g, ''));
              setSubmitError('');
            },
            phonePlaceholder: PHONE_NUMBER_PLACEHOLDER,
            selectorStyle: styles.telecomSelector,
            telecomTextStyle: styles.telecomText,
            placeholderTextStyle: styles.placeholderText,
            phoneInputContainerStyle: [
              styles.underlineContainer,
              { marginTop: hp(32) },
            ],
            phoneInputStyle: [
              styles.bareInput,
              { letterSpacing: phone.length > 0 ? 2 : 0 },
            ],
            errorTextStyle: styles.errorText,
            errorText: submitError,
            chevronIconSize: wp(24),
            chevronIconColor: COLORS.textPrimary,
            placeholderTextColor: COLORS.textTertiary,
          },
        }}
        extraContent={
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
        }
        telecomModalVisible={isTelecomModalVisible}
        onCloseTelecomModal={() => setIsTelecomModalVisible(false)}
        onSelectTelecom={handleSelectTelecom}
        telecomOptions={TELECOM_OPTIONS}
        telecomBottomInset={insets.bottom}
        telecomModalOverlayStyle={styles.modalOverlay}
        telecomModalContentStyle={styles.modalContent}
        telecomModalHeaderStyle={styles.modalHeader}
        telecomModalTitleStyle={styles.modalTitle}
        telecomModalItemStyle={styles.modalItem}
        telecomModalItemTextStyle={styles.modalItemText}
      />
    );
  }

  return (
    <IdentityVerificationCodeStage
      containerStyle={styles.container}
      contentBaseStyle={styles.verifyContent}
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
      keypadWrapperBaseStyle={styles.keypadWrapper}
      bottomContainerStyle={styles.bottomContainer}
      stepIndicatorContainerStyle={{ marginTop: 0, marginBottom: hp(12) }}
      topPadding={hp(28)}
      bottomMinPadding={hp(24)}
      onBack={backToForm}
      backIconSize={wp(24)}
      backIconColor={COLORS.textPrimary}
      loadingIndicatorColor={COLORS.primary}
      successIconColor={COLORS.success}
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
      actionLabel="회원 탈퇴"
      actionLoading={isDeleting}
      actionDisabled={isDeleting}
      onActionPress={() => void handleWithdraw()}
      actionContainerStyle={styles.withdrawButton}
      actionDisabledContainerStyle={styles.disabledButton}
      actionTextStyle={styles.withdrawButtonText}
      actionLoadingColor={COLORS.white}
    />
  );
}
