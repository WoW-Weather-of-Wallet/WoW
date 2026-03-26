import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IdentityVerificationFormStage from '../../components/common/IdentityVerificationFormStage';
import IdentityVerificationCodeStage from '../../components/common/IdentityVerificationCodeStage';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import {
  PHONE_NUMBER_PLACEHOLDER,
  SEND_CODE_LABEL,
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
      <IdentityVerificationFormStage
        containerStyle={styles.container}
        scrollContentStyle={styles.scrollContent}
        backButtonStyle={styles.backButton}
        stepIndicatorContainerStyle={{ marginTop: 0, marginBottom: hp(12) }}
        titleStyle={styles.title}
        subtitleStyle={styles.formSubtitle}
        bottomContainerStyle={styles.bottomContainer}
        title={'\uc0c8 \ud734\ub300\ud3f0 \ubc88\ud638\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.'}
        subtitle={'\ud1b5\uc2e0\uc0ac\ub97c \uc120\ud0dd\ud55c \ub4a4 \ubcc0\uacbd\ud560 \ud734\ub300\ud3f0 \ubc88\ud638\ub85c \uc778\uc99d\ubc88\ud638\ub97c \ubc1b\uc544 \uc9c4\ud589\ud569\ub2c8\ub2e4.'}
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
            value: profileName,
            displayValue: profileName || '-',
            editable: false,
            containerStyle: styles.underlineContainer,
            valueStyle: [
              styles.bareText,
              { letterSpacing: profileName ? 2 : 0 },
            ],
          },
          ssnSection: {
            frontValue: expectedSsnFront,
            backValue: expectedSsnBack,
            frontEditable: false,
            backEditable: false,
            containerStyle: styles.ssnSection,
            frontContainerStyle: [
              styles.underlineContainer,
              { flex: 1.1, justifyContent: 'center' },
            ],
            frontValueStyle: [
              styles.bareText,
              {
                textAlign: 'center',
                letterSpacing: expectedSsnFront ? 4 : 0,
              },
            ],
            backContainerStyle: [
              styles.underlineContainer,
              styles.ssnBackContainer,
            ],
            backValueStyle: [styles.bareText, styles.ssnBackText],
            dashStyle: styles.dash,
            maskingTextStyle: styles.ssnMasking,
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
            phoneVisible: telecom !== TELECOM_PLACEHOLDER,
            animatePhoneInput: true,
            chevronIconSize: wp(24),
            chevronIconColor: COLORS.textPrimary,
            placeholderTextColor: COLORS.textTertiary,
          },
        }}
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
          ? '\ud734\ub300\ud3f0 \ubc88\ud638 \uc778\uc99d\uc774\n\uc644\ub8cc\ub418\uc5c8\uc5b4\uc694.'
          : '\uc778\uc99d\ubc88\ud638 6\uc790\ub9ac\ub97c\n\uc785\ub825\ud574 \uc8fc\uc138\uc694.'
      }
      subtitle={`${requestedPhoneDisplay} \ubc88\ud638\ub85c \uc804\uc1a1\ub41c \uc778\uc99d\ubc88\ud638\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText={'\uc778\uc99d\ubc88\ud638\ub97c \ud655\uc778\ud558\uace0 \uc788\uc5b4\uc694.'}
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage={'\uc778\uc99d \uc644\ub8cc! \ud734\ub300\ud3f0 \ubc88\ud638\ub97c \ubcc0\uacbd\ud560 \uc218 \uc788\uc5b4\uc694.'}
      isSending={isSending}
      onResend={() => void resendCode()}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      actionLabel={'\ud734\ub300\ud3f0 \ubc88\ud638 \ubcc0\uacbd'}
      actionLoading={isUpdating}
      actionDisabled={isUpdating}
      onActionPress={() => void handleUpdatePhone()}
      actionContainerStyle={styles.updateButton}
      actionDisabledContainerStyle={styles.disabledButton}
      actionTextStyle={styles.updateButtonText}
      actionLoadingColor={COLORS.white}
    />
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  backButton: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(40),
    letterSpacing: -0.5,
    marginBottom: hp(8),
  },
  formSubtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(24),
    marginBottom: hp(24),
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(24),
    marginBottom: hp(20),
  },
  inputSection: {
    marginBottom: hp(24),
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  bareInput: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  bareText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  ssnSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: hp(24),
  },
  dash: {
    fontSize: fp(20),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    marginHorizontal: wp(12),
    marginBottom: hp(16),
  },
  ssnBackContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ssnBackText: {
    width: wp(30),
    textAlign: 'center',
  },
  ssnMasking: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: wp(4),
  },
  telecomSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
    minHeight: hp(50),
  },
  telecomText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textTertiary,
  },
  errorText: {
    marginTop: hp(8),
    textAlign: 'center',
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  bottomContainer: {
    paddingHorizontal: wp(28),
    paddingTop: hp(8),
    backgroundColor: COLORS.background,
  },
  confirmButton: {
    backgroundColor: COLORS.border,
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
    color: COLORS.textPrimary,
  },
  activeButtonText: {
    color: COLORS.textInverse,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyContent: {
    flex: 1,
    paddingHorizontal: wp(28),
    paddingTop: hp(32),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(16),
    marginBottom: hp(24),
  },
  dot: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: COLORS.gray200,
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    marginTop: hp(8),
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  successText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: hp(6),
    marginBottom: hp(12),
  },
  resendText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
  keypadWrapper: {
    backgroundColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(16),
  },
  modalHeader: {
    marginBottom: hp(16),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  modalItem: {
    paddingVertical: hp(18),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalItemText: {
    fontSize: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
} as const;
