import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
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
import DevShortcutButton from '../../components/common/DevShortcutButton';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { sendSmsCode } from '../../services/auth';
import { extractApiErrorMessage } from '@shared';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'];
const TELECOM_PLACEHOLDER = '통신사를 선택해주세요';

export default function PhoneAuthScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const ssnFrontRef = useRef<TextInput>(null);
  const ssnBackRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

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
   * 이 단계가 성공해야만 다음 VerifyCode 화면이 의미가 있습니다.
   */
  const handleSendCode = async () => {
    if (isSendingCode) {
      return;
    }

    setIsSendingCode(true);
    setSubmitError('');

    try {
      await sendSmsCode({ phoneNumber: phone });

      navigation.navigate('VerifyCode', {
        name,
        ssnFront,
        ssnBack,
        telecom,
        phone,
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
          onPress: () => setTermsVisible(true),
        };
    }
  };

  const btnState = getButtonState();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + hp(60), paddingBottom: insets.bottom + hp(40) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {step === 1
            ? '이름을\n입력해주세요.'
            : step === 2
              ? '주민등록번호를\n입력해주세요.'
              : '휴대폰 번호를\n입력해주세요.'}
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

        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <TouchableOpacity style={styles.telecomSelector} onPress={() => setModalVisible(true)}>
              <Text style={[styles.telecomText, telecom === TELECOM_PLACEHOLDER && styles.placeholderText]}>
                {telecom}
              </Text>
              <Ionicons name="chevron-down" size={wp(24)} color="#1A1A1A" />
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

        {/* 백엔드 문자 발송 상태와 무관하게 다음 화면 UI 개발을 이어가기 위한 우회 진입점입니다. */}
        <DevShortcutButton
          label="TEST: 인증번호 입력 화면으로 이동"
          description="문자 발송 API 가 실패해도 VerifyCode 화면 UI 개발을 계속 진행할 수 있습니다."
          onPress={() =>
            navigation.navigate('VerifyCode', {
              name: name || '테스트 사용자',
              ssnFront: ssnFront || '000101',
              ssnBack: ssnBack || '3',
              telecom: telecom === TELECOM_PLACEHOLDER ? 'SKT' : telecom,
              phone: phone || '01012345678',
            })
          }
        />
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
        <TouchableOpacity
          style={[styles.confirmButton, btnState.isActive && styles.activeButton]}
          disabled={!btnState.isActive}
          onPress={btnState.onPress}
        >
          {isSendingCode ? (
            <ActivityIndicator color="#FFFFFF" />
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
        onClose={() => setTermsVisible(false)}
        onConfirm={() => {
          setTermsVisible(false);
          handleSendCode();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: wp(28) },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(40),
    marginBottom: hp(40),
    letterSpacing: -0.5,
  },
  inputSection: { marginBottom: hp(32) },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  bareInput: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    padding: 0,
    margin: 0,
  },
  ssnSection: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: hp(32) },
  dash: {
    fontSize: fp(20),
    fontFamily: FONTS.regular,
    color: '#1A1A1A',
    marginHorizontal: wp(12),
    marginBottom: hp(16),
  },
  ssnBackContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  ssnMasking: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    letterSpacing: wp(6),
    marginTop: Platform.OS === 'ios' ? hp(4) : 0,
  },
  telecomSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
  },
  telecomText: { fontSize: fp(24), fontFamily: FONTS.bold, color: '#1A1A1A' },
  placeholderText: { color: COLORS.textTertiary },
  errorText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
    marginTop: hp(12),
  },
  bottomContainer: { paddingHorizontal: wp(28), backgroundColor: '#FFFFFF', paddingTop: hp(12) },
  confirmButton: { backgroundColor: '#E5E7EB', borderRadius: wp(30), paddingVertical: hp(16), alignItems: 'center' },
  activeButton: { backgroundColor: COLORS.primary },
  confirmButtonText: { fontSize: fp(20), fontFamily: FONTS.bold, color: '#1A1A1A' },
  activeButtonText: { color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(16),
  },
  modalHeader: { marginBottom: hp(16), alignItems: 'center' },
  modalTitle: { fontSize: fp(18), fontFamily: FONTS.bold, color: '#1A1A1A' },
  modalItem: { paddingVertical: hp(18), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: fp(18), fontFamily: FONTS.medium, color: '#1A1A1A', textAlign: 'center' },
});
