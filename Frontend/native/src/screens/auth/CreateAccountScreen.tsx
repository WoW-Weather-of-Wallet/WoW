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
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CreateAccountScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);

  // 비밀번호 가리기 관련 상태
  const [isPwVisible, setIsPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  // 수동 마스킹으로 인한 타이핑 버그(IME 충돌) 방지 및 OS 표준 보안 준수를 위해 순정 secureTextEntry 방식 복귀.

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);
  const confirmPwRef = useRef<TextInput>(null);

  // 1단계: 아이디 중복 확인 모의 로직 ('admin'일 경우 중복 처리)
  const handleCheckId = () => {
    if (id.length < 4) return;
    
    setIsCheckingId(true);
    setTimeout(() => {
      setIsCheckingId(false);
      
      if (id.toLowerCase() === 'admin') {
        setIsIdAvailable(false); // 중복 아이디 모의 처리
      } else {
        setIsIdAvailable(true); // 통과 모의 처리
        // 통과 후 다음 스텝(비밀번호)으로 오토포커싱
        setTimeout(() => {
          setStep(Math.max(step, 2));
          pwRef.current?.focus();
        }, 400);
      }
    }, 800);
  };

  // 2단계 비밀번호 정규식 필터링 (영어, 숫자, 특수문자만 허용)
  const handlePasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setPassword(filteredText);
  };

  // 3단계 비밀번호 확인 정규식 필터링
  const handleConfirmPasswordChange = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, '');
    setConfirmPassword(filteredText);
  };

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  
  // 전체 폼 유효성 검사
  const isFormValid = isIdAvailable && isPasswordMatch;

  const handleNextStep = () => {
    if (step === 2 && isPasswordValid) {
      setStep(3);
      setTimeout(() => confirmPwRef.current?.focus(), 150);
    }
  };

  const handleCreateAccount = () => {
    if (!isFormValid) return;
    
    console.log('계정 생성 정보:', { id, password });
    navigation.replace('Welcome', { ...route.params, id });
  };

  const handleIdChange = (text: string) => {
    setId(text);
    if (isIdAvailable !== null) {
      setIsIdAvailable(null);
    }
  };

  // 하단 메인 버튼의 상태를 동적으로 제어
  const getButtonState = () => {
    if (step === 1) {
      return { text: '다음', isActive: false, onPress: undefined };
    }
    if (step === 2) {
      return { 
        text: '다음', 
        isActive: isPasswordValid, 
        onPress: handleNextStep 
      };
    }
    return { 
      text: '계정 생성하기', 
      isActive: isFormValid, 
      onPress: handleCreateAccount 
    };
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
          {step === 1 ? '사용하실 아이디를\n입력해주세요.' : step === 2 ? '비밀번호를\n설정해주세요.' : '비밀번호를\n한번 더 입력해주세요.'}
        </Text>

        {/* 1단계: 아이디 입력 */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <View style={styles.idInputRow}>
            <View style={[styles.underlineContainer, { flex: 1 }]}>
              <TextInput
                ref={idRef}
                style={[styles.bareInput, { letterSpacing: id.length > 0 ? 1 : 0 }]}
                value={id}
                onChangeText={handleIdChange}
                placeholder="아이디 (4자 이상)"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={id.length >= 4 && isIdAvailable === null ? handleCheckId : undefined}
                editable={!isCheckingId}
                autoFocus
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkButton, 
                id.length >= 4 ? styles.checkButtonActive : styles.checkButtonInactive,
                isIdAvailable === true && styles.checkButtonSuccess
              ]}
              disabled={id.length < 4 || isCheckingId || isIdAvailable === true}
              onPress={handleCheckId}
            >
              {isCheckingId ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : isIdAvailable === true ? (
                <Ionicons name="checkmark" size={wp(20)} color="#FFFFFF" />
              ) : (
                <Text style={styles.checkButtonText}>중복확인</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {isIdAvailable === true && (
            <Animated.Text entering={FadeInDown.duration(300)} style={styles.successMessage}>
              사용 가능한 아이디입니다.
            </Animated.Text>
          )}
          {isIdAvailable === false && (
            <Animated.Text entering={FadeInDown.duration(300)} style={styles.errorMessage}>
              이미 사용 중인 아이디입니다.
            </Animated.Text>
          )}
        </Animated.View>

        {/* 2단계: 비밀번호 설정 */}
        {step >= 2 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={[styles.underlineContainer, styles.passwordRow]}>
              <TextInput
                ref={pwRef}
                style={[styles.bareInput, { flex: 1, letterSpacing: password.length > 0 ? 4 : 0 }]}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isPwVisible} // OS 기본 기능 사용 (타이핑 씹힘/반복 버그 방지)
                returnKeyType="next"
                onSubmitEditing={handleNextStep}
              />
              <TouchableOpacity onPress={() => setIsPwVisible(!isPwVisible)} style={styles.eyeIcon} activeOpacity={0.7}>
                <Ionicons 
                  name={isPwVisible ? "eye-outline" : "eye-off-outline"} 
                  size={wp(24)} 
                  color={isPwVisible ? COLORS.primary : COLORS.textTertiary} 
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 8 && (
              <Text style={styles.guideMessage}>비밀번호는 8자 이상 입력해주세요.</Text>
            )}
          </Animated.View>
        )}

        {/* 3단계: 비밀번호 재입력 */}
        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <View style={[styles.underlineContainer, styles.passwordRow]}>
              <TextInput
                ref={confirmPwRef}
                style={[styles.bareInput, { flex: 1, letterSpacing: confirmPassword.length > 0 ? 4 : 0 }]}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="비밀번호 재입력"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isConfirmPwVisible}
                returnKeyType="done"
                onSubmitEditing={handleCreateAccount}
              />
              <TouchableOpacity onPress={() => setIsConfirmPwVisible(!isConfirmPwVisible)} style={styles.eyeIcon} activeOpacity={0.7}>
                <Ionicons 
                  name={isConfirmPwVisible ? "eye-outline" : "eye-off-outline"} 
                  size={wp(24)} 
                  color={isConfirmPwVisible ? COLORS.primary : COLORS.textTertiary} 
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !isPasswordMatch && password.length >= 8 && (
              <Text style={styles.errorMessage}>비밀번호가 일치하지 않습니다.</Text>
            )}
            {isPasswordMatch && (
              <Animated.Text entering={FadeInDown.duration(300)} style={styles.successMessage}>
                비밀번호가 일치합니다.
              </Animated.Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* 하단 확인 버튼 */}
      {step >= 2 && (
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.bottomContainer, { paddingBottom: insets.bottom || hp(24) }]}>
          <TouchableOpacity 
            style={[styles.confirmButton, btnState.isActive && styles.activeButton]} 
            disabled={!btnState.isActive}
            onPress={btnState.onPress}
          >
            <Text style={[styles.confirmButtonText, btnState.isActive && styles.activeButtonText]}>
              {btnState.text}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContent: { 
    paddingHorizontal: wp(28) 
  },
  title: { 
    fontSize: fp(28), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A', 
    lineHeight: fp(40), 
    marginBottom: hp(40), 
    letterSpacing: -0.5 
  },
  
  inputSection: { 
    marginBottom: hp(32) 
  },
  idInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bareInput: {
    fontSize: fp(20),
    fontFamily: FONTS.semiBold,
    color: '#1A1A1A',
    padding: 0,
    margin: 0,
  },
  eyeIcon: {
    padding: wp(4), // 터치 영역 확보
  },

  checkButton: {
    paddingHorizontal: wp(16),
    height: hp(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(8),
    marginBottom: hp(4), // 밑줄과 밸런스를 맞추기 위한 미세 여백
  },
  checkButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  checkButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  checkButtonSuccess: {
    backgroundColor: '#22C55E', // 초록색 스마일/체크마크 등 성공 의미
  },
  checkButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },

  successMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#22C55E',
    marginTop: hp(8),
  },
  errorMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
    marginTop: hp(8),
  },
  guideMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: hp(8),
  },
  
  bottomContainer: { 
    paddingHorizontal: wp(28), 
    backgroundColor: '#FFFFFF', 
    paddingTop: hp(12) 
  },
  confirmButton: { 
    backgroundColor: '#E5E7EB', 
    borderRadius: wp(30), 
    paddingVertical: hp(16), 
    alignItems: 'center' 
  },
  activeButton: { 
    backgroundColor: COLORS.primary 
  },
  confirmButtonText: { 
    fontSize: fp(20), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A' 
  },
  activeButtonText: { 
    color: '#FFFFFF' 
  },
});
