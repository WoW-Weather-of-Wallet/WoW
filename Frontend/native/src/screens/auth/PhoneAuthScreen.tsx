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
import { COLORS, wp, hp } from '../../constants/theme';
import { sendSmsCode } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { validateName, validatePhone } from '../../utils/validation';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'];
const TELECOM_PLACEHOLDER = '통신사를 선택해주세요';

export default function PhoneAuthScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  // 회원가입 payload로 넘길 약관 동의 완료 여부
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

  /**
   * 약관 동의 이후 실제 SMS 발송 API 를 호출합니다.
   * 백엔드가 회원가입 전에 인증 완료 상태를 요구하므로,
   * 이 단계가 성공해야만 다음 VerifyCode 화면과 CreateAccount 화면이 의미가 있습니다.
   * 수집한 이름/주민번호 일부/휴대폰/약관동의 여부를 다음 스텝 route param으로 넘깁니다.
   */
  const handleSendCode = async (agreedTerms = termsAgreed) => {
    if (isSendingCode) {
      return;
    }

    setIsSendingCode(true);
    setSubmitError('');

    /**
     * [Defense-Log] 백엔드 요청값 검증(P2) 부재에 대응
     * SMS 발송 전 이름과 전화번호 형식을 프론트엔드에서 먼저 검증합니다.
     */
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

    try {
      await sendSmsCode({ phoneNumber: phone.replace(/[^0-9]/g, '') });

      navigation.navigate('VerifyCode', {
        name: name.trim(),
        ssnFront,
        ssnBack,
        telecom,
        phone: phone.replace(/[^0-9]/g, ''),
        termsAgreed: agreedTerms,
      });
    } catch (error: any) {
      // SMS 발송 실패도 다른 auth 화면과 같은 규칙으로 에러 메시지를 정리합니다.
      const message = extractApiErrorMessage(
        error,
        '인증번호 발송에 실패했어요. 휴대폰 번호를 다시 확인해주세요.',
      );

      setSubmitError(message);
      Alert.alert('인증번호 발송 실패', message);
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
            setStep((prev) => Math.max(prev, 3));
            ssnBackRef.current?.blur();
            setTimeout(() => setModalVisible(true), 300);
          },
        };
      default:
        return {
          isActive: telecom !== TELECOM_PLACEHOLDER && phone.length >= 10 && !isSendingCode,
          text: isSendingCode ? '인증번호 발송 중...' : '다음',
          onPress: () => {
            // [UX-Refinement] 약관 모달이 뜰 때 구슬 진행바가 노치에 가려지는 것을 방지하기 위해 최상단으로 스크롤
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            setTermsVisible(true);
          },
        };
    }
  };

  const btnState = getButtonState();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + CONSTANTS.scrollContentPaddingTop, paddingBottom: insets.bottom + CONSTANTS.scrollContentPaddingBottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator currentStep={1} totalSteps={5} />

        <Text style={styles.title}>
          본인 확인을 위해{'\n'}인증이 필요해요.
        </Text>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
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
              onSubmitEditing={handleNameSubmit}
              returnKeyType="next"
              autoFocus
            />
          </View>
        </Animated.View>

        {step >= 2 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.ssnSection}>
            <View style={[styles.underlineContainer, { flex: 1.1, justifyContent: 'center' }]}>
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
                style={[styles.bareInput, { width: CONSTANTS.ssnBackInputWidth, textAlign: 'center', letterSpacing: 4 }]}
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
            <TouchableOpacity style={styles.telecomSelector} onPress={() => setModalVisible(true)}>
              <Text style={[styles.telecomText, telecom === TELECOM_PLACEHOLDER && styles.placeholderText]}>
                {telecom}
              </Text>
              <Ionicons name="chevron-down" size={CONSTANTS.chevronIconSize} color={COLORS.textPrimary} />
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
                placeholder="휴대폰 번호 (- 없이 입력)"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            {submitError.length > 0 && <Text style={styles.errorText}>{submitError}</Text>}
          </Animated.View>
        )}

      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, CONSTANTS.bottomMinPadding) }]}>
        <TouchableOpacity
          style={[styles.confirmButton, btnState.isActive && styles.activeButton]}
          disabled={!btnState.isActive}
          onPress={btnState.onPress}
        >
          {isSendingCode ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <Text style={[styles.confirmButtonText, btnState.isActive && styles.activeButtonText]}>
              {btnState.text}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>통신사를 선택해주세요</Text>
            </View>
            {TELECOMS.map((item) => (
              <TouchableOpacity key={item} style={styles.modalItem} onPress={() => handleTelecomSelect(item)}>
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
          // 필수 약관 동의가 끝난 시점의 값을 회원가입 플로우 전체에서 재사용한다.
          setTermsAgreed(agreed);
          setTermsVisible(false);
          handleSendCode(agreed);
        }}
      />
    </KeyboardAvoidingView>
  );
}


