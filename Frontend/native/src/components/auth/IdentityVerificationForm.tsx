import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, wp, hp } from '../../constants/theme';
import { TELECOM_OPTIONS } from '../../constants/auth/identityVerification';
import { useIdentityVerificationForm } from '../../hooks';
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

/**
 * IdentityVerificationForm
 * 이름, 주민등록번호, 통신사, 휴대폰 번호를 단계별로 입력받는 공통 폼 컴포넌트입니다.
 * 회원가입, 아이디 찾기, 비밀번호 찾기 등 본인확인이 필요한 모든 곳에서 재사용됩니다.
 */
export default function IdentityVerificationForm({
  onComplete,
  submitButtonText = '인증번호 받기',
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
      {/* 1단계: 이름 */}
      <View style={styles.inputSection}>
        <View style={styles.underlineContainer}>
          <TextInput
            style={[styles.bareInput, { letterSpacing: name.length > 0 ? 2 : 0 }]}
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
        {nameHelperText ? <Text style={styles.errorText}>{nameHelperText}</Text> : null}
      </View>

      {/* 2단계: 주민등록번호 */}
      {step >= 2 && (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.ssnSection}>
          <View style={[styles.underlineContainer, { flex: 1.1 }]}>
            <TextInput
              ref={ssnFrontRef}
              style={[styles.bareInput, { textAlign: 'center', letterSpacing: ssnFront.length > 0 ? 4 : 0 }]}
              value={ssnFront}
              onChangeText={handleSsnFrontChange}
              placeholder="YYMMDD"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <Text style={styles.dash}>-</Text>
          <View style={[styles.underlineContainer, styles.ssnBackContainer]}>
            <TextInput
              ref={ssnBackRef}
              style={[styles.bareInput, { width: wp(30), textAlign: 'center', letterSpacing: 4 }]}
              value={ssnBack}
              onChangeText={handleSsnBackChange}
              keyboardType="number-pad"
              maxLength={1}
            />
            <Text style={styles.ssnMasking}>******</Text>
          </View>
        </Animated.View>
      )}

      {/* 3단계: 통신사 및 휴대폰 번호 */}
      {step >= 3 && (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <TouchableOpacity style={styles.telecomSelector} onPress={openTelecomModal}>
            <Text style={[styles.telecomText, telecom === TELECOM_PLACEHOLDER && styles.placeholderText]}>
              {telecom}
            </Text>
            <Ionicons name="chevron-down" size={wp(24)} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
            <TextInput
              ref={phoneRef}
              style={[styles.bareInput, { letterSpacing: phone.length > 0 ? 2 : 0 }]}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="휴대폰 번호 (- 없이 입력)"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>
        </Animated.View>
      )}

      {errorMessage.length > 0 && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={[styles.buttonWrapper, { marginBottom: Math.max(insets.bottom, hp(20)) }]}>
        <TouchableOpacity
          style={[styles.confirmButton, isFormValid && !isSubmitting && styles.activeButton]}
          disabled={!isFormValid || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={[styles.confirmButtonText, isFormValid && styles.activeButtonText]}>
              {step < 3 ? '다음' : submitButtonText}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 통신사 선택 모달 */}
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

