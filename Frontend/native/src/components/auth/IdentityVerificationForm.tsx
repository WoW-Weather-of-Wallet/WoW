import React from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, hp, wp } from '../../constants/theme';
import { TELECOM_OPTIONS } from '../../constants/auth/identityVerification';
import { useIdentityVerificationForm } from '../../hooks';
import AuthActionButton from '../common/AuthActionButton';
import IdentitySsnSection from '../common/IdentitySsnSection';
import TelecomPhoneInputSection from '../common/TelecomPhoneInputSection';
import TelecomSelectModal from '../common/TelecomSelectModal';
import type { IdentityVerificationData } from '../../types/auth';
import { styles } from './IdentityVerificationForm.styles';

const TELECOM_PLACEHOLDER = '통신사를 선택해주세요';

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

export default function IdentityVerificationForm({
  onComplete,
  submitButtonText = '인증번호 발송',
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
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <View style={styles.underlineContainer}>
          <TextInput
            style={[
              styles.bareInput,
              { letterSpacing: name.length > 0 ? 2 : 0 },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="이름"
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={handleNameSubmit}
            returnKeyType="next"
            autoFocus={autoFocusName}
            editable={nameEditable}
          />
        </View>
        {nameHelperText ? (
          <Text style={styles.errorText}>{nameHelperText}</Text>
        ) : null}
      </View>

      {step >= 2 ? (
        <Animated.View entering={FadeInDown.duration(500)}>
          <IdentitySsnSection
            frontValue={ssnFront}
            backValue={ssnBack}
            onFrontChange={handleSsnFrontChange}
            onBackChange={handleSsnBackChange}
            frontInputRef={ssnFrontRef}
            backInputRef={ssnBackRef}
            containerStyle={styles.ssnSection}
            frontContainerStyle={[styles.underlineContainer, { flex: 1.1 }]}
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
              {
                width: wp(30),
                textAlign: 'center',
                letterSpacing: 4,
              },
            ]}
            dashStyle={styles.dash}
            maskingTextStyle={styles.ssnMasking}
            placeholderTextColor={COLORS.textTertiary}
          />
        </Animated.View>
      ) : null}

      {step >= 3 ? (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <TelecomPhoneInputSection
            telecom={telecom}
            telecomPlaceholder={TELECOM_PLACEHOLDER}
            phone={phone}
            onOpenTelecomModal={openTelecomModal}
            onPhoneChange={handlePhoneChange}
            phonePlaceholder="휴대폰 번호 (- 없이 입력)"
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
            phoneInputRef={phoneRef}
            chevronIconSize={wp(24)}
            chevronIconColor={COLORS.textPrimary}
            placeholderTextColor={COLORS.textTertiary}
          />
        </Animated.View>
      ) : null}

      {errorMessage.length > 0 ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={[styles.buttonWrapper, { marginBottom: Math.max(insets.bottom, hp(20)) }]}>
        <AuthActionButton
          label={step < 3 ? '다음' : submitButtonText}
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          active={isFormValid && !isSubmitting}
          onPress={handleSubmit}
          containerStyle={styles.confirmButton}
          activeContainerStyle={styles.activeButton}
          textStyle={styles.confirmButtonText}
          activeTextStyle={styles.activeButtonText}
          loadingColor={COLORS.white}
        />
      </View>

      <TelecomSelectModal
        visible={modalVisible}
        onClose={closeTelecomModal}
        onSelect={handleTelecomSelect}
        title="통신사를 선택해주세요"
        options={TELECOM_OPTIONS}
        bottomInset={insets.bottom}
        overlayStyle={styles.modalOverlay}
        contentStyle={styles.modalContent}
        headerStyle={styles.modalHeader}
        titleStyle={styles.modalTitle}
        itemStyle={styles.modalItem}
        itemTextStyle={styles.modalItemText}
      />
    </View>
  );
}

export type { IdentityVerificationData as IdentityData };
