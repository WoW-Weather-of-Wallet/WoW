import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import {
  IDENTITY_NEXT_LABEL,
  PHONE_NUMBER_PLACEHOLDER,
  SEND_CODE_LABEL,
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
} from '../../constants/auth/identityVerification';
import { useIdentityVerificationForm } from '../../hooks';
import type { IdentityVerificationData } from '../../types/auth';
import AuthActionButton from '../common/AuthActionButton';
import IdentityVerificationFields from '../common/IdentityVerificationFields';
import TelecomSelectModal from '../common/TelecomSelectModal';

interface IdentityVerificationFormProps {
  onComplete: (data: IdentityVerificationData) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onValuesChange?: (data: IdentityVerificationData) => void;
  initialValues?: Partial<IdentityVerificationData>;
  nameEditable?: boolean;
  nameHelperText?: string;
  autoFocusName?: boolean;
}

const inputSectionStyle = {
  marginBottom: hp(32),
};

const underlineContainerStyle = {
  borderBottomWidth: 1.5,
  borderBottomColor: COLORS.textPrimary,
  paddingVertical: hp(8),
  minHeight: hp(50),
  justifyContent: 'center' as const,
};

const bareInputStyle = {
  fontSize: fp(24),
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
  padding: 0,
  margin: 0,
};

const ssnSectionStyle = {
  flexDirection: 'row' as const,
  alignItems: 'flex-end' as const,
  marginBottom: hp(32),
};

const dashStyle = {
  fontSize: fp(20),
  fontFamily: FONTS.regular,
  color: COLORS.textPrimary,
  marginHorizontal: wp(12),
  marginBottom: hp(16),
};

const ssnBackContainerStyle = {
  flex: 1,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};

const ssnMaskingStyle = {
  fontSize: fp(24),
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
  letterSpacing: wp(6),
  marginTop: Platform.OS === 'ios' ? hp(4) : 0,
};

const telecomSelectorStyle = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  borderBottomWidth: 1.5,
  borderBottomColor: COLORS.textPrimary,
  paddingVertical: hp(8),
};

const telecomTextStyle = {
  fontSize: fp(24),
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
};

const placeholderTextStyle = {
  color: COLORS.textTertiary,
};

const errorTextStyle = {
  fontSize: fp(14),
  fontFamily: FONTS.medium,
  color: COLORS.error,
  marginTop: hp(12),
  textAlign: 'center' as const,
};

const confirmButtonStyle = {
  backgroundColor: COLORS.gray200,
  borderRadius: wp(30),
  paddingVertical: hp(16),
  alignItems: 'center' as const,
};

const activeButtonStyle = {
  backgroundColor: COLORS.primary,
};

const confirmButtonTextStyle = {
  fontSize: fp(20),
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
};

const activeButtonTextStyle = {
  color: COLORS.white,
};

const modalOverlayStyle = {
  flex: 1,
  backgroundColor: COLORS.modalOverlay,
  justifyContent: 'flex-end' as const,
};

const modalContentStyle = {
  backgroundColor: COLORS.white,
  borderTopLeftRadius: wp(24),
  borderTopRightRadius: wp(24),
  paddingHorizontal: wp(24),
  paddingTop: hp(24),
  paddingBottom: hp(16),
};

const modalHeaderStyle = {
  marginBottom: hp(16),
  alignItems: 'center' as const,
};

const modalTitleStyle = {
  fontSize: fp(18),
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
};

const modalItemStyle = {
  paddingVertical: hp(18),
  borderBottomWidth: 1,
  borderBottomColor: COLORS.gray100,
};

const modalItemTextStyle = {
  fontSize: fp(18),
  fontFamily: FONTS.medium,
  color: COLORS.textPrimary,
  textAlign: 'center' as const,
};

export default function IdentityVerificationForm({
  onComplete,
  submitButtonText = SEND_CODE_LABEL,
  isSubmitting = false,
  errorMessage = '',
  onValuesChange,
  initialValues,
  nameEditable = true,
  nameHelperText,
  autoFocusName = true,
}: IdentityVerificationFormProps) {
  const insets = useSafeAreaInsets();
  const {
    step,
    name,
    ssnFront,
    ssnBack,
    telecom,
    phone,
    modalVisible,
    isFormValid,
    ssnFrontRef,
    ssnBackRef,
    phoneRef,
    setName,
    handleNameSubmit,
    handleSsnFrontChange,
    handleSsnBackChange,
    handleTelecomSelect,
    handlePhoneChange,
    openTelecomModal,
    closeTelecomModal,
    handleSubmit,
  } = useIdentityVerificationForm({
    initialValues,
    telecomPlaceholder: TELECOM_PLACEHOLDER,
    onComplete,
    onValuesChange,
  });

  return (
    <View className="flex-1">
      <IdentityVerificationFields
        nameWrapperStyle={inputSectionStyle}
        phoneWrapperStyle={inputSectionStyle}
        nameSection={{
          value: name,
          containerStyle: underlineContainerStyle,
          valueStyle: [
            bareInputStyle,
            { letterSpacing: name.length > 0 ? 2 : 0 },
          ],
          helperText: nameHelperText,
          helperTextStyle: errorTextStyle,
          placeholderTextColor: COLORS.textTertiary,
          editable: nameEditable,
          onChangeText: setName,
          inputProps: {
            onSubmitEditing: handleNameSubmit,
            returnKeyType: 'next',
            autoFocus: autoFocusName,
          },
        }}
        ssnSection={
          step >= 2
            ? {
                frontValue: ssnFront,
                backValue: ssnBack,
                onFrontChange: handleSsnFrontChange,
                onBackChange: handleSsnBackChange,
                frontInputRef: ssnFrontRef,
                backInputRef: ssnBackRef,
                containerStyle: ssnSectionStyle,
                frontContainerStyle: [underlineContainerStyle, { flex: 1.1 }],
                frontValueStyle: [
                  bareInputStyle,
                  {
                    textAlign: 'center',
                    letterSpacing: ssnFront.length > 0 ? 4 : 0,
                  },
                ],
                backContainerStyle: [
                  underlineContainerStyle,
                  ssnBackContainerStyle,
                ],
                backValueStyle: [
                  bareInputStyle,
                  {
                    width: wp(30),
                    textAlign: 'center',
                    letterSpacing: 4,
                  },
                ],
                dashStyle,
                maskingTextStyle: ssnMaskingStyle,
                placeholderTextColor: COLORS.textTertiary,
              }
            : undefined
        }
        phoneSection={
          step >= 3
            ? {
                telecom,
                telecomPlaceholder: TELECOM_PLACEHOLDER,
                phone,
                onOpenTelecomModal: openTelecomModal,
                onPhoneChange: handlePhoneChange,
                phonePlaceholder: PHONE_NUMBER_PLACEHOLDER,
                selectorStyle: telecomSelectorStyle,
                telecomTextStyle,
                placeholderTextStyle,
                phoneInputContainerStyle: [
                  underlineContainerStyle,
                  { marginTop: hp(32) },
                ],
                phoneInputStyle: [
                  bareInputStyle,
                  { letterSpacing: phone.length > 0 ? 2 : 0 },
                ],
                phoneInputRef: phoneRef,
                chevronIconSize: wp(24),
                chevronIconColor: COLORS.textPrimary,
                placeholderTextColor: COLORS.textTertiary,
              }
            : undefined
        }
      />

      {errorMessage.length > 0 ? (
        <Text style={errorTextStyle}>{errorMessage}</Text>
      ) : null}

      <View
        style={{
          marginTop: 'auto',
          paddingTop: hp(20),
          marginBottom: Math.max(insets.bottom, hp(20)),
        }}
      >
        <AuthActionButton
          label={step < 3 ? IDENTITY_NEXT_LABEL : submitButtonText}
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          active={isFormValid && !isSubmitting}
          onPress={handleSubmit}
          containerStyle={confirmButtonStyle}
          activeContainerStyle={activeButtonStyle}
          textStyle={confirmButtonTextStyle}
          activeTextStyle={activeButtonTextStyle}
          loadingColor={COLORS.white}
        />
      </View>

      <TelecomSelectModal
        visible={modalVisible}
        onClose={closeTelecomModal}
        onSelect={handleTelecomSelect}
        title={TELECOM_PLACEHOLDER}
        options={TELECOM_OPTIONS}
        bottomInset={insets.bottom}
        overlayStyle={modalOverlayStyle}
        contentStyle={modalContentStyle}
        headerStyle={modalHeaderStyle}
        titleStyle={modalTitleStyle}
        itemStyle={modalItemStyle}
        itemTextStyle={modalItemTextStyle}
      />
    </View>
  );
}

export type { IdentityVerificationData as IdentityData };
