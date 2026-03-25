import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, wp, hp } from '../../constants/theme';
import { styles } from './IdentityVerificationForm.styles';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'];
const TELECOM_PLACEHOLDER = '통신사를 선택해주세요';

export interface IdentityData {
  name: string;
  ssnFront: string;
  ssnBack: string;
  telecom: string;
  phone: string;
}

interface IdentityVerificationFormProps {
  onComplete: (data: IdentityData) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onValuesChange?: (data: IdentityData) => void;
}

/**
 * IdentityVerificationForm
 * 이름, 주민등록번호, 통신사, 휴대폰 번호를 단계별로 입력받는 공통 폼 컴포넌트입니다.
 * 회원가입, 아이디 찾기, 비밀번호 찾기 등 본인확인이 필요한 모든 곳에서 재사용됩니다.
 */
export default function IdentityVerificationForm({
  onComplete,
  submitButtonText = '다음',
  isSubmitting = false,
  errorMessage = '',
  onValuesChange,
}: IdentityVerificationFormProps) {
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState(TELECOM_PLACEHOLDER);
  const [phone, setPhone] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const ssnFrontRef = useRef<TextInput>(null);
  const ssnBackRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // 값이 변경될 때마다 부모 컴포넌트에 알림 (선택 사항)
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange({ name, ssnFront, ssnBack, telecom, phone });
    }
  }, [name, ssnFront, ssnBack, telecom, phone]);

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

  const isFormValid = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return ssnFront.length === 6 && ssnBack.length === 1;
    return telecom !== TELECOM_PLACEHOLDER && phone.length >= 10;
  };

  const handleSubmit = () => {
    if (step < 3) {
      if (step === 1) handleNameSubmit();
      else if (step === 2) {
        setStep(3);
        setTimeout(() => setModalVisible(true), 100);
      }
    } else {
      onComplete({ name, ssnFront, ssnBack, telecom, phone });
    }
  };

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
            autoFocus
          />
        </View>
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
          <TouchableOpacity style={styles.telecomSelector} onPress={() => setModalVisible(true)}>
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
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
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
          style={[styles.confirmButton, isFormValid() && !isSubmitting && styles.activeButton]}
          disabled={!isFormValid() || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={[styles.confirmButtonText, isFormValid() && styles.activeButtonText]}>
              {step < 3 ? '다음' : '인증번호 받기'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 통신사 선택 모달 */}
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
    </View>
  );
}

