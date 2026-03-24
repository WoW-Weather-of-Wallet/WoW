import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import StepIndicator from '../../components/common/StepIndicator';
import { styles, CONSTANTS } from './PhoneAuthScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import {
  checkSignupIdentity,
  checkSsafySignup,
  sendSmsCode,
} from '../../services/auth';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { validateName, validatePhone } from '../../utils/validation';

const TELECOMS = [
  'SKT',
  'KT',
  'LG U+',
  'SKT 알뜰폰',
  'KT 알뜰폰',
  'LG U+ 알뜰폰',
];

const TELECOM_PLACEHOLDER =
  '통신사를 선택해 주세요';
const INVALID_IDENTITY_MESSAGE =
  '주민등록번호를 다시 확인해 주세요.';
const SSAFY_TOKEN_EXPIRED_MESSAGE =
  'SSAFY 인증 정보가 만료되었습니다. 다시 로그인해 주세요.';
const SEND_CODE_FALLBACK =
  '인증번호 전송에 실패했어요. 입력한 정보를 다시 확인해 주세요.';

const buildBirthDate = (front: string, back: string) => {
  if (front.length !== 6 || back.length !== 1) {
    return null;
  }

  const yearPrefix = ['3', '4', '7', '8'].includes(back) ? '20' : '19';
  return `${yearPrefix}${front.slice(0, 2)}-${front.slice(2, 4)}-${front.slice(4, 6)}`;
};

const buildGender = (back: string) => {
  if (!back) {
    return null;
  }

  return parseInt(back, 10) % 2 !== 0 ? 'M' : 'F';
};

const decodeUnicodeEscapes = (value: string) =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

export default function PhoneAuthScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const signupMode = route.params?.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';
  const initialSsafyName =
    typeof route.params?.name === 'string'
      ? decodeUnicodeEscapes(route.params.name).trim()
      : '';

  const [step, setStep] = useState(isSsafySignup && initialSsafyName.length >= 2 ? 2 : 1);
  const [name, setName] = useState(initialSsafyName);
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  // The signup APIs still accept one boolean, so we collapse the sheet result
  // into "all required terms were agreed" before moving to the next screen.
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const ssnFrontRef = useRef<TextInput>(null);
  const ssnBackRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNameSubmit = () => {
    if (name.trim().length >= 2) {
      setStep((prev) => Math.max(prev, 2));
      setTimeout(() => ssnFrontRef.current?.focus(), 150);
    }
  };

  const handleSsnFrontChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setSsnFront(numeric);

    if (numeric.length === 6) {
      ssnBackRef.current?.focus();
    }
  };

  const handleSsnBackChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setSsnBack(numeric);

    if (numeric.length === 1) {
      setStep((prev) => Math.max(prev, 3));
      ssnBackRef.current?.blur();
      setTimeout(() => setModalVisible(true), 300);
    }
  };

  const handleTelecomSelect = (value: string) => {
    setTelecom(value);
    setModalVisible(false);
    setTimeout(() => phoneRef.current?.focus(), 250);
  };

  const handleSendCode = async (agreedTerms = termsAgreed) => {
    if (isSendingCode) {
      return;
    }

    setIsSendingCode(true);
    setSubmitError('');

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setSubmitError(nameValidation.message);
      setIsSendingCode(false);
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      setSubmitError(phoneValidation.message);
      setIsSendingCode(false);
      return;
    }

    const birthDate = buildBirthDate(ssnFront, ssnBack);
    const gender = buildGender(ssnBack);

    if (!birthDate || !gender) {
      setSubmitError(INVALID_IDENTITY_MESSAGE);
      setIsSendingCode(false);
      return;
    }

    const normalizedPhoneNumber = phone.replace(/[^0-9]/g, '');

    try {
      if (isSsafySignup) {
        if (!route.params?.pendingToken) {
          throw new Error(SSAFY_TOKEN_EXPIRED_MESSAGE);
        }

        await checkSsafySignup({
          pendingToken: route.params.pendingToken,
          gender,
          birthDate,
          phoneNumber: normalizedPhoneNumber,
        });
      } else {
        await checkSignupIdentity({
          name: name.trim(),
          gender,
          birthDate,
          phoneNumber: normalizedPhoneNumber,
        });
      }

      await sendSmsCode({ phoneNumber: normalizedPhoneNumber });

      navigation.navigate('VerifyCode', {
        ...route.params,
        signupMode,
        name: name.trim(),
        ssnFront,
        ssnBack,
        telecom,
        phone: normalizedPhoneNumber,
        // Downstream screens keep using the existing boolean contract, which now
        // means agreement to the full required terms set.
        termsAgreed: agreedTerms,
      });
    } catch (error: any) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: SEND_CODE_FALLBACK,
      });
      setSubmitError(presentation.inlineMessage);
      Alert.alert(
        isSsafySignup
          ? 'SSAFY 회원가입 안내'
          : presentation.title,
        presentation.alertMessage,
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const getButtonState = () => {
    switch (step) {
      case 1:
        return {
          isActive: name.trim().length >= 2,
          text: '다음',
          onPress: handleNameSubmit,
        };
      case 2:
        return {
          isActive: ssnFront.length === 6 && ssnBack.length === 1,
          text: '다음',
          onPress: () => {
            setStep((prev) => Math.max(prev, 2));
            ssnBackRef.current?.blur();
            setTimeout(() => setModalVisible(true), 300);
          },
        };
      default:
        return {
          isActive:
            telecom !== TELECOM_PLACEHOLDER &&
            phone.length >= 10 &&
            !isSendingCode,
          text: isSendingCode
            ? '인증번호 전송 중...'
            : '다음',
          onPress: () => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            setTermsVisible(true);
          },
        };
    }
  };

  const btnState = getButtonState();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + CONSTANTS.scrollContentPaddingTop,
            paddingBottom: insets.bottom + CONSTANTS.scrollContentPaddingBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator currentStep={1} totalSteps={5} />

        <Text style={styles.title}>
          {'본인 확인을 위해'}{'\n'}
          {'인증이 필요해요.'}
        </Text>
        <Text style={{ color: COLORS.textTertiary, marginTop: hp(12), lineHeight: hp(22) }}>
          {
            '인증번호 요청 전에 필수 약관 전체 동의가 필요해요.'
          }
        </Text>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <View style={styles.underlineContainer}>
            <TextInput
              style={[styles.bareInput, { letterSpacing: name.length > 0 ? 2 : 0 }]}
              value={name}
              onChangeText={(value) => {
                if (isSsafySignup) {
                  return;
                }
                setName(value);
                setSubmitError('');
              }}
              placeholder="이름"
              placeholderTextColor={COLORS.textTertiary}
              onSubmitEditing={handleNameSubmit}
              returnKeyType="next"
              autoFocus={!isSsafySignup}
              editable={!isSsafySignup}
            />
          </View>
          {isSsafySignup && (
            <Text style={{ color: COLORS.textTertiary, marginTop: hp(12) }}>
              {'SSAFY 계정의 이름은 수정할 수 없어요.'}
            </Text>
          )}
        </Animated.View>

        {step >= 2 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.ssnSection}>
            <View
              style={[
                styles.underlineContainer,
                { flex: 1.1, justifyContent: 'center' },
              ]}
            >
              <TextInput
                ref={ssnFrontRef}
                style={[
                  styles.bareInput,
                  {
                    textAlign: 'center',
                    letterSpacing: ssnFront.length > 0 ? 4 : 0,
                  },
                ]}
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
                style={[
                  styles.bareInput,
                  {
                    width: CONSTANTS.ssnBackInputWidth,
                    textAlign: 'center',
                    letterSpacing: 4,
                  },
                ]}
                value={ssnBack}
                onChangeText={handleSsnBackChange}
                keyboardType="number-pad"
                maxLength={1}
              />
              <Text style={styles.ssnMasking}>******</Text>
            </View>
          </Animated.View>
        )}

        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <TouchableOpacity
              style={styles.telecomSelector}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={[
                  styles.telecomText,
                  telecom === TELECOM_PLACEHOLDER && styles.placeholderText,
                ]}
              >
                {telecom}
              </Text>
              <Ionicons
                name="chevron-down"
                size={CONSTANTS.chevronIconSize}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
              <TextInput
                ref={phoneRef}
                style={[styles.bareInput, { letterSpacing: phone.length > 0 ? 2 : 0 }]}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  setSubmitError('');
                }}
                placeholder={
                  '휴대폰 번호 (- 없이 입력)'
                }
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            {submitError.length > 0 && <Text style={styles.errorText}>{submitError}</Text>}
          </Animated.View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, CONSTANTS.bottomMinPadding) },
        ]}
      >
        <TouchableOpacity
          style={[styles.confirmButton, btnState.isActive && styles.activeButton]}
          disabled={!btnState.isActive}
          onPress={btnState.onPress}
        >
          {isSendingCode ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <Text
              style={[
                styles.confirmButtonText,
                btnState.isActive && styles.activeButtonText,
              ]}
            >
              {btnState.text}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {'통신사를 선택해 주세요'}
              </Text>
            </View>
            {TELECOMS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.modalItem}
                onPress={() => handleTelecomSelect(item)}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: insets.bottom }} />
          </View>
        </Pressable>
      </Modal>

      <TermsBottomSheet
        visible={termsVisible}
        flow={route.params?.flow}
        onClose={() => setTermsVisible(false)}
        onConfirm={(agreed) => {
          setTermsAgreed(agreed);
          setTermsVisible(false);
          void handleSendCode(agreed);
        }}
      />
    </KeyboardAvoidingView>
  );
}
