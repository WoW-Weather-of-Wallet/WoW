/**
 * WithdrawScreen
 * 회원 탈퇴 전 본인 확인을 회원가입과 동일한 폼/인증 UI로 진행합니다.
 */
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
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../../components/common/StepIndicator';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import { styles } from './WithdrawScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import {
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
  VERIFICATION_CODE_LENGTH,
} from '../../constants/auth/identityVerification';
import {
  deleteAccount,
  normalizePhoneNumber,
} from '../../services/auth';
import { clearPersistedAuthSession } from '../../services/sessionStorage';
import { useAuthStore } from '../../store/authStore';
import { fcmService } from '../../services/fcmService';
import { extractApiErrorMessage } from '../../utils/error';
import { buildIdentityBackFromProfile, buildIdentityFrontFromBirthDate } from '../../utils/profileIdentity';
import { validateName, validatePhone } from '../../utils/validation';
import { useSmsVerification } from '../../hooks';
import type { MyPageStackScreenProps } from '../../types';

const normalizeName = (name: string) => name.trim().replace(/\s+/g, '');

export default function WithdrawScreen({
  navigation,
  route,
}: MyPageStackScreenProps<'Withdraw'>) {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);

  const rawPhone: string = route.params?.phoneNumber ?? '';
  const profileName: string = route.params?.name ?? '';
  const profileBirthDate: string = route.params?.birthDate ?? '';
  const profileGender: string = route.params?.gender ?? '';

  const expectedSsnFront = buildIdentityFrontFromBirthDate(profileBirthDate);
  const expectedSsnBack = buildIdentityBackFromProfile(profileGender, profileBirthDate);

  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [isTelecomModalVisible, setIsTelecomModalVisible] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    phase,
    code,
    verifyError,
    requestedPhoneDisplay,
    isSending,
    isVerifying,
    isVerified,
    startVerification,
    handlePressNumber,
    handlePressDelete,
    resendCode,
    backToForm,
  } = useSmsVerification({
    sendFallbackMessage: '인증번호를 보내지 못했어요. 다시 시도해주세요.',
    resendFallbackMessage: '인증번호 재발송에 실패했어요. 잠시 후 다시 시도해주세요.',
    verifyFallbackMessage: '인증번호가 올바르지 않아요. 다시 확인해주세요.',
  });

  const validateAgainstProfile = () => {
    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return nameValidation.message;
    }

    const phoneValidation = validatePhone(normalizedPhoneNumber);
    if (!phoneValidation.isValid) {
      return phoneValidation.message;
    }

    if (ssnFront.length !== 6) {
      return '생년월일 앞 6자리를 입력해주세요.';
    }

    if (ssnBack.length !== 1) {
      return '주민번호 뒷자리 첫 번째 숫자를 입력해주세요.';
    }

    if (telecom === TELECOM_PLACEHOLDER) {
      return '통신사를 선택해주세요.';
    }

    if (normalizeName(name) !== normalizeName(profileName)) {
      return '등록된 이름과 일치하지 않습니다.';
    }

    if (ssnFront !== expectedSsnFront || ssnBack !== expectedSsnBack) {
      return '등록된 생년월일 또는 성별 정보와 일치하지 않습니다.';
    }

    if (normalizedPhoneNumber !== normalizePhoneNumber(rawPhone)) {
      return '등록된 휴대폰 번호와 일치하지 않습니다.';
    }

    return null;
  };

  const handleSelectTelecom = (value: string) => {
    setTelecom(value);
    setIsTelecomModalVisible(false);
    setSubmitError('');
  };

  const handleSendCode = async () => {
    if (isSending || !rawPhone) {
      return;
    }

    const validationMessage = validateAgainstProfile();
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phone);
    setSubmitError('');
    await startVerification(normalizedPhoneNumber);
  };

  const handleWithdraw = async () => {
    if (!isVerified || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      try {
        await fcmService.unregisterFcmToken();
      } catch (fcmError) {
        console.warn('[Withdraw] FCM 토큰 해제 실패:', fcmError);
      }

      await deleteAccount();
      await clearPersistedAuthSession();
      logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '회원 탈퇴를 처리하지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('회원 탈퇴 실패', message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (phase === 'form') {
    const isButtonActive =
      name.trim().length >= 2 &&
      ssnFront.length === 6 &&
      ssnBack.length === 1 &&
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
            <Text style={styles.title}>탈퇴 전{'\n'}본인 확인이 필요해요.</Text>
            <Text style={styles.formSubtitle}>
              회원가입 때 입력한 정보를 다시 입력하면{'\n'}인증번호를 발송해 드려요.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.inputSection}>
            <View style={styles.underlineContainer}>
              <TextInput
                style={[styles.bareInput, { letterSpacing: name.length > 0 ? 2 : 0 }]}
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

          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.ssnSection}>
            <View style={[styles.underlineContainer, { flex: 1.1, justifyContent: 'center' }]}>
              <TextInput
                style={[
                  styles.bareInput,
                  { textAlign: 'center', letterSpacing: ssnFront.length > 0 ? 4 : 0 },
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

            <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
              <TextInput
                style={[styles.bareInput, { letterSpacing: phone.length > 0 ? 2 : 0 }]}
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

            {submitError.length > 0 && <Text style={styles.errorText}>{submitError}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.warningBox}>
            <Ionicons name="warning-outline" size={wp(18)} color={COLORS.error} />
            <Text style={styles.warningText}>
              탈퇴 시 거래 내역과 설정이 즉시 삭제되며 복구할 수 없습니다.
            </Text>
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
      </KeyboardAvoidingView>
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
      keypadWrapperStyle={[styles.keypadWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}
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
      title={isVerified ? '본인 확인이\n완료되었어요.' : '인증번호 6자리를\n입력해 주세요.'}
      subtitle={`${requestedPhoneDisplay}으로 전송된 인증번호를 입력해 주세요.`}
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage="본인 확인 완료! 탈퇴 버튼을 눌러주세요."
      isSending={isSending}
      onResend={() => void resendCode()}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      bottomAction={
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
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
