import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import SecureKeypad from '../../components/common/SecureKeypad';
import StepIndicator from '../../components/common/StepIndicator';
import { styles } from './PhoneUpdateScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import {
  sendSmsCode,
  verifySmsCode,
  updatePhone,
  normalizePhoneNumber,
} from '../../services/auth';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { extractApiErrorMessage } from '../../utils/error';
import { validatePhone } from '../../utils/validation';
import type { MyPageStackScreenProps } from '../../types';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'];
const TELECOM_PLACEHOLDER = '통신사를 선택해 주세요';
const MAX_CODE_LENGTH = 6;

const toBirthFront = (birthDate: string): string => {
  if (!birthDate) return '';
  const digits = birthDate.replace(/-/g, '');
  return digits.length >= 8 ? digits.slice(2, 8) : '';
};

const toBirthBack = (gender: string, birthDate: string): string => {
  if (!gender || !birthDate) return '';
  const year = parseInt(birthDate.slice(0, 4), 10);
  const isMale = gender === 'M';
  if (year >= 2000) return isMale ? '3' : '4';
  return isMale ? '1' : '2';
};

const maskPhone = (phone: string): string => {
  if (!phone) return '-';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
  return phone;
};

export default function PhoneUpdateScreen({
  navigation,
  route,
}: MyPageStackScreenProps<'PhoneUpdate'>) {
  const insets = useSafeAreaInsets();

  const rawPhone: string = route.params?.phoneNumber ?? '';
  const profileName: string = route.params?.name ?? '';
  const profileBirthDate: string = route.params?.birthDate ?? '';
  const profileGender: string = route.params?.gender ?? '';
  const expectedSsnFront = toBirthFront(profileBirthDate);
  const expectedSsnBack = toBirthBack(profileGender, profileBirthDate);

  const [phase, setPhase] = useState<'form' | 'verify'>('form');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isTelecomModalVisible, setIsTelecomModalVisible] = useState(false);
  const [requestedPhoneNumber, setRequestedPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const validateForm = () => {
    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    const phoneValidation = validatePhone(normalizedPhoneNumber);

    if (telecom === TELECOM_PLACEHOLDER) {
      return '통신사를 선택해주세요.';
    }

    if (!phoneValidation.isValid) {
      return phoneValidation.message;
    }

    if (normalizedPhoneNumber === normalizePhoneNumber(rawPhone)) {
      return '현재 번호와 다른 휴대폰 번호를 입력해주세요.';
    }

    return null;
  };

  const handleSelectTelecom = (value: string) => {
    setTelecom(value);
    setIsTelecomModalVisible(false);
    setSubmitError('');
  };

  const handleSendCode = async () => {
    if (isSending) {
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    setIsSending(true);
    setSubmitError('');

    try {
      await sendSmsCode({ phoneNumber: normalizedPhoneNumber });
      setRequestedPhoneNumber(normalizedPhoneNumber);
      setCode('');
      setVerifyError('');
      setIsVerified(false);
      setPhase('verify');
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: '인증번호를 보내지 못했어요. 다시 시도해주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (finalCode: string) => {
    if (!requestedPhoneNumber) {
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      await verifySmsCode({
        phoneNumber: requestedPhoneNumber,
        code: finalCode,
      });
      setIsVerified(true);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-verify',
        fallbackMessage: '인증번호가 올바르지 않아요. 다시 확인해주세요.',
      });
      setVerifyError(presentation.inlineMessage);
      setCode('');
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePressNumber = (num: string) => {
    if (isVerifying || isVerified || code.length >= MAX_CODE_LENGTH) {
      return;
    }

    const nextCode = code + num;
    setCode(nextCode);

    if (nextCode.length === MAX_CODE_LENGTH) {
      void handleVerifyCode(nextCode);
    }
  };

  const handlePressDelete = () => {
    if (isVerifying || code.length === 0) {
      return;
    }

    setCode((prev) => prev.slice(0, -1));
  };

  const handleResendCode = async () => {
    if (isSending || !requestedPhoneNumber) {
      return;
    }

    setIsSending(true);
    setCode('');
    setVerifyError('');
    setIsVerified(false);

    try {
      await sendSmsCode({ phoneNumber: requestedPhoneNumber });
      Alert.alert('재발송 완료', `${maskPhone(requestedPhoneNumber)}으로 인증번호를 다시 전송했습니다.`);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: '인증번호 재발송에 실패했어요. 잠시 후 다시 시도해주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!isVerified || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await updatePhone({ phoneNumber: requestedPhoneNumber });
      Alert.alert('변경 완료', '휴대폰 번호가 성공적으로 변경되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '휴대폰 번호를 변경하지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('휴대폰 번호 변경 실패', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderDots = () =>
    Array.from({ length: MAX_CODE_LENGTH }).map((_, index) => (
      <View key={`phone-update-dot-${index}`} style={[styles.dot, index < code.length && styles.dotFilled]} />
    ));

  if (phase === 'form') {
    const isButtonActive =
      telecom !== TELECOM_PLACEHOLDER &&
      phone.length >= 10 &&
      !isSending;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + hp(28), paddingBottom: insets.bottom + hp(28) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={{ marginTop: 0, marginBottom: hp(12) }}>
            <StepIndicator currentStep={1} totalSteps={2} compact />
          </View>

          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.title}>새 휴대폰 번호를 입력해주세요.</Text>
            <Text style={styles.formSubtitle}>통신사 선택 후, 새로운 번호로 본인 인증을 진행합니다.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.inputSection}>
            <View style={styles.underlineContainer}>
              <Text style={[styles.bareText, { letterSpacing: profileName ? 2 : 0 }]}>
                {profileName || '-'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.ssnSection}>
            <View style={[styles.underlineContainer, { flex: 1.1, justifyContent: 'center' }]}>
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
              <Text style={[styles.bareText, styles.ssnBackText]}>{expectedSsnBack || '0'}</Text>
              <Text style={styles.ssnMasking}>******</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.inputSection}>
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
              <Ionicons name="chevron-down" size={wp(24)} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {telecom !== TELECOM_PLACEHOLDER ? (
              <Animated.View entering={FadeInDown.duration(350)}>
                <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
                  <TextInput
                    style={[styles.bareInput, { letterSpacing: phone.length > 0 ? 2 : 0 }]}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      setSubmitError('');
                    }}
                    placeholder="새 휴대폰 번호 (- 없이 입력)"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="number-pad"
                    maxLength={11}
                  />
                </View>
              </Animated.View>
            ) : null}

            {submitError.length > 0 ? <Text style={styles.errorText}>{submitError}</Text> : null}
          </Animated.View>
        </ScrollView>

        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
          <TouchableOpacity
            style={[styles.confirmButton, isButtonActive && styles.activeButton]}
            disabled={!isButtonActive}
            onPress={() => void handleSendCode()}
          >
            {isSending ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={[styles.confirmButtonText, isButtonActive && styles.activeButtonText]}>
                인증번호 발송
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={isTelecomModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setIsTelecomModalVisible(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>통신사를 선택해 주세요</Text>
              </View>
              {TELECOMS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => handleSelectTelecom(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: insets.bottom }} />
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verifyContent, { paddingTop: insets.top + hp(28) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => setPhase('form')}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={{ marginTop: 0, marginBottom: hp(12) }}>
          <StepIndicator currentStep={2} totalSteps={2} compact />
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>
            {isVerified ? '휴대폰 번호 확인이\n완료되었어요.' : '인증번호 6자리를\n입력해 주세요.'}
          </Text>
          <Text style={styles.subtitle}>
            {maskPhone(requestedPhoneNumber)}으로 전송된 인증번호를 입력해 주세요.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.dotsContainer}>
          {renderDots()}
        </Animated.View>

        {isVerifying ? (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.loadingText}>인증번호를 확인하고 있어요.</Text>
          </View>
        ) : null}

        {isVerified ? (
          <View style={styles.feedbackRow}>
            <Ionicons name="checkmark-circle" size={wp(18)} color={COLORS.success} />
            <Text style={styles.successText}>인증 완료! 변경 버튼을 눌러주세요.</Text>
          </View>
        ) : null}

        {verifyError.length > 0 && !isVerified ? (
          <Text style={styles.errorText}>{verifyError}</Text>
        ) : null}

        {!isVerified ? (
          <View style={styles.resendRow}>
            <TouchableOpacity onPress={() => void handleResendCode()} disabled={isSending}>
              <Text style={styles.resendText}>
                {isSending ? '재발송 중...' : '인증번호 다시 받기'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {!isVerified ? (
        <View style={[styles.keypadWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
          <SecureKeypad onPressNumber={handlePressNumber} onPressDelete={handlePressDelete} />
        </View>
      ) : (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
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
      )}
    </View>
  );
}
