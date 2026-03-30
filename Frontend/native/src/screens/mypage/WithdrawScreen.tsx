import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
        title={'\ud68c\uc6d0 \ud0c8\ud1f4 \uc804\n\ubcf8\uc778 \ud655\uc778\uc744 \uc9c4\ud589\ud574 \uc8fc\uc138\uc694.'}
        subtitle={'\ud68c\uc6d0 \uc815\ubcf4\uc640 \uc77c\uce58\ud558\ub294 \ub0b4\uc6a9\uc744\n\uc785\ub825\ud574\uc57c \uc778\uc99d\ubc88\ud638\ub97c \ubc1b\uc744 \uc218 \uc788\uc5b4\uc694.'}
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
              {'\ud0c8\ud1f4 \ud6c4\uc5d0\ub294 \uacc4\uc815 \uc815\ubcf4\uc640 \uc11c\ube44\uc2a4 \ub370\uc774\ud130\uac00 \uc0ad\uc81c\ub418\uba70 \ubcf5\uad6c\ud560 \uc218 \uc5c6\uc5b4\uc694.'}
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
          ? '\ubcf8\uc778 \ud655\uc778\uc774\n\uc644\ub8cc\ub418\uc5c8\uc5b4\uc694.'
          : '\uc778\uc99d\ubc88\ud638 6\uc790\ub9ac\ub97c\n\uc785\ub825\ud574 \uc8fc\uc138\uc694.'
      }
      subtitle={`${requestedPhoneDisplay} \ubc88\ud638\ub85c \uc804\uc1a1\ub41c \uc778\uc99d\ubc88\ud638\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText={'\uc778\uc99d\ubc88\ud638\ub97c \ud655\uc778\ud558\uace0 \uc788\uc5b4\uc694.'}
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage={'\ubcf8\uc778 \ud655\uc778 \uc644\ub8cc! \ud0c8\ud1f4\ub97c \uc9c4\ud589\ud560 \uc218 \uc788\uc5b4\uc694.'}
      isSending={isSending}
      onResend={() => void resendCode()}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      actionLabel={'\ud68c\uc6d0 \ud0c8\ud1f4'}
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
    marginBottom: hp(28),
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
  ssnBackInput: {
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: COLORS.dangerBackground,
    borderRadius: RADIUS.md,
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
  },
  warningText: {
    flex: 1,
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    lineHeight: fp(20),
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
  withdrawButton: {
    backgroundColor: COLORS.error,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  withdrawButtonText: {
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
  errorText: {
    marginTop: hp(8),
    textAlign: 'center',
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
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
} as const;
