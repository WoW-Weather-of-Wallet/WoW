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
import { checkSignupIdentity, sendSmsCode } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { validateName, validatePhone } from '../../utils/validation';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT \uC54C\uB730\uD3F0', 'KT \uC54C\uB730\uD3F0', 'LG U+ \uC54C\uB730\uD3F0'];
const TELECOM_PLACEHOLDER = '\uD1B5\uC2E0\uC0AC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694';

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

export default function PhoneAuthScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const signupMode = route.params?.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';
  const initialSsafyName = typeof route.params?.name === 'string' ? route.params.name.trim() : '';

  const [step, setStep] = useState(isSsafySignup && initialSsafyName.length >= 2 ? 2 : 1);
  const [name, setName] = useState(initialSsafyName);
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
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
      setSubmitError('\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.');
      setIsSendingCode(false);
      return;
    }

    const normalizedPhoneNumber = phone.replace(/[^0-9]/g, '');

    try {
      if (isSsafySignup && !route.params?.pendingToken) {
        throw new Error('SSAFY \uC778\uC99D \uC815\uBCF4\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.');
      }

      await checkSignupIdentity({
        name: name.trim(),
        gender,
        birthDate,
        phoneNumber: normalizedPhoneNumber,
      });

      await sendSmsCode({ phoneNumber: normalizedPhoneNumber });

      navigation.navigate('VerifyCode', {
        ...route.params,
        signupMode,
        name: name.trim(),
        ssnFront,
        ssnBack,
        telecom,
        phone: normalizedPhoneNumber,
        termsAgreed: agreedTerms,
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        '\uC778\uC99D\uBC88\uD638 \uC804\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC785\uB825\uD55C \uC815\uBCF4\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
      );
      setSubmitError(message);
      Alert.alert(isSsafySignup ? 'SSAFY \uD68C\uC6D0\uAC00\uC785 \uC548\uB0B4' : '\uC778\uC99D\uBC88\uD638 \uC804\uC1A1 \uC2E4\uD328', message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const getButtonState = () => {
    switch (step) {
      case 1:
        return {
          isActive: name.trim().length >= 2,
          text: '\uB2E4\uC74C',
          onPress: handleNameSubmit,
        };
      case 2:
        return {
          isActive: ssnFront.length === 6 && ssnBack.length === 1,
          text: '\uB2E4\uC74C',
          onPress: () => {
            setStep((prev) => Math.max(prev, 3));
            ssnBackRef.current?.blur();
            setTimeout(() => setModalVisible(true), 300);
          },
        };
      default:
        return {
          isActive: telecom !== TELECOM_PLACEHOLDER && phone.length >= 10 && !isSendingCode,
          text: isSendingCode ? '\uC778\uC99D\uBC88\uD638 \uC804\uC1A1 \uC911...' : '\uB2E4\uC74C',
          onPress: () => {
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
          {'\uBCF8\uC778 \uD655\uC778\uC744 \uC704\uD574'}{'\n'}{'\uC778\uC99D\uC774 \uD544\uC694\uD574\uC694.'}
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
              placeholder="\uC774\uB984"
              placeholderTextColor={COLORS.textTertiary}
              onSubmitEditing={handleNameSubmit}
              returnKeyType="next"
              autoFocus={!isSsafySignup}
              editable={!isSsafySignup}
            />
          </View>
          {isSsafySignup && (
            <Text style={{ color: COLORS.textTertiary, marginTop: hp(12) }}>{'SSAFY\uC5D0\uC11C \uC804\uB2EC\uB41C \uC774\uB984\uC774\uB77C \uC218\uC815\uD560 \uC218 \uC5C6\uC5B4\uC694.'}</Text>
          )}
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
                placeholder="\uD734\uB300\uD3F0 \uBC88\uD638 (- \uC5C6\uC774 \uC785\uB825)"
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
              <Text style={styles.modalTitle}>{'\uD1B5\uC2E0\uC0AC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694'}</Text>
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
          setTermsAgreed(agreed);
          setTermsVisible(false);
          void handleSendCode(agreed);
        }}
      />
    </KeyboardAvoidingView>
  );
}

