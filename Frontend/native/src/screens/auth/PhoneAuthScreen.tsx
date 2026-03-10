import React, { useState, useRef } from 'react';
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
  Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';

const TELECOMS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'];

export default function PhoneAuthScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [ssnFront, setSsnFront] = useState('');
  const [ssnBack, setSsnBack] = useState('');
  const [telecom, setTelecom] = useState('통신사 선택');
  const [phone, setPhone] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const ssnFrontRef = useRef<TextInput>(null);
  const ssnBackRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // 진행 상태에 따른 애니메이션 핸들러
  const handleNameSubmit = () => {
    if (name.length >= 2) {
      setStep(Math.max(step, 2));
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
      setStep(Math.max(step, 3));
      // 통신사 선택 유도를 위해 포커스 해제 후 모달 띄우기
      ssnBackRef.current?.blur();
      setTimeout(() => setModalVisible(true), 300);
    }
  };

  const handleTelecomSelect = (val: string) => {
    setTelecom(val);
    setModalVisible(false);
    setTimeout(() => phoneRef.current?.focus(), 300);
  };

  const getButtonState = () => {
    switch (step) {
      case 1:
        return {
          isActive: name.length >= 2,
          text: '확인',
          onPress: () => {
            setStep(2);
            setTimeout(() => ssnFrontRef.current?.focus(), 150);
          },
        };
      case 2:
        return {
          isActive: ssnFront.length === 6 && ssnBack.length === 1,
          text: '확인',
          onPress: () => {
            setStep(3);
            ssnBackRef.current?.blur();
            setTimeout(() => setModalVisible(true), 300);
          },
        };
      case 3:
      default:
        return {
          isActive: telecom !== '통신사 선택' && phone.length >= 10,
          text: '확인',
          onPress: () => {
            setTermsVisible(true);
          },
        };
    }
  };

  const btnState = getButtonState();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + hp(60), paddingBottom: insets.bottom + hp(40) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {step === 1 ? '이름을\n입력해주세요.' : step === 2 ? '주민등록번호를\n입력해주세요.' : '전화번호를\n입력해주세요.'}
        </Text>

        {/* 1단계: 이름 입력 */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <View style={styles.underlineContainer}>
            <TextInput
              ref={nameRef}
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
        </Animated.View>

        {/* 2단계: 주민번호 입력 */}
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

        {/* 3단계: 통신사 및 전화번호 입력 */}
        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <TouchableOpacity style={styles.telecomSelector} onPress={() => setModalVisible(true)}>
              <Text style={[styles.telecomText, telecom === '통신사 선택' && { color: COLORS.textTertiary }]}>{telecom}</Text>
              <Ionicons name="chevron-down" size={wp(24)} color="#1A1A1A" />
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

      </ScrollView>

      {/* 하단 확인 버튼 */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom || hp(24) }]}>
        <TouchableOpacity 
          style={[styles.confirmButton, btnState.isActive && styles.activeButton]} 
          disabled={!btnState.isActive}
          onPress={btnState.onPress}
        >
          <Text style={[styles.confirmButtonText, btnState.isActive && styles.activeButtonText]}>{btnState.text}</Text>
        </TouchableOpacity>
      </View>

      {/* 통신사 선택 바텀시트 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>통신사 선택</Text>
            </View>
            {TELECOMS.map(t => (
              <TouchableOpacity key={t} style={styles.modalItem} onPress={() => handleTelecomSelect(t)}>
                <Text style={styles.modalItemText}>{t}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: insets.bottom }} />
          </View>
        </Pressable>
      </Modal>

      {/* 약관 동의 바텀시트 모달 */}
      <TermsBottomSheet 
        visible={termsVisible} 
        onClose={() => setTermsVisible(false)} 
        onConfirm={() => {
          console.log('인증번호 입력 화면으로 이동');
          // navigation.navigate('VerifyCode'); // TODO: 다음 단계 화면 연결
        }} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: wp(28) },
  title: { fontSize: fp(28), fontFamily: FONTS.bold, color: '#1A1A1A', lineHeight: fp(40), marginBottom: hp(40), letterSpacing: -0.5 },
  
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
  dash: { fontSize: fp(20), fontFamily: FONTS.regular, color: '#1A1A1A', marginHorizontal: wp(12), marginBottom: hp(16) },
  ssnBackContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  ssnMasking: { fontSize: fp(24), fontFamily: FONTS.bold, color: '#1A1A1A', letterSpacing: wp(6), marginTop: Platform.OS === 'ios' ? hp(4) : 0 },
  
  telecomSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
  },
  telecomText: { fontSize: fp(24), fontFamily: FONTS.bold, color: '#1A1A1A' },
  
  bottomContainer: { paddingHorizontal: wp(28), backgroundColor: '#FFFFFF', paddingTop: hp(12) },
  confirmButton: { backgroundColor: '#E5E7EB', borderRadius: wp(30), paddingVertical: hp(16), alignItems: 'center' },
  activeButton: { backgroundColor: COLORS.primary },
  confirmButtonText: { fontSize: fp(20), fontFamily: FONTS.bold, color: '#1A1A1A' },
  activeButtonText: { color: '#FFFFFF' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(24), paddingTop: hp(24), paddingBottom: hp(16) },
  modalHeader: { marginBottom: hp(16), alignItems: 'center' },
  modalTitle: { fontSize: fp(18), fontFamily: FONTS.bold, color: '#1A1A1A' },
  modalItem: { paddingVertical: hp(18), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: fp(18), fontFamily: FONTS.medium, color: '#1A1A1A', textAlign: 'center' },
});
