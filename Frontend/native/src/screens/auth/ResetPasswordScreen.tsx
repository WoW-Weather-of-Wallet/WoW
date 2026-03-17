import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';
import CustomTextInput from '../../components/common/CustomTextInput';
import { extractApiErrorMessage } from '../../utils/error';
import { validatePassword } from '../../utils/validation';

/**
 * ResetPasswordScreen
 * 본인인증 완료 후 새로운 비밀번호를 설정하는 화면입니다.
 */
export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userId } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 비밀번호(PW) 보안 검증: 중앙화된 validatePassword 유틸리티를 사용합니다.
   * 영문 대/소문자, 숫자, 특수문자 조합 및 연속성/반복성/아이디 대조 등을 모두 검사합니다.
   */
  const passwordValidation = validatePassword(password, userId);
  const isPasswordValid = passwordValidation.isValid;
  const isFormValid = 
    isPasswordValid && 
    confirmPassword.length >= 8 && 
    password === confirmPassword;

  const handleReset = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      // TODO: 비밀번호 재설정 API 호출 연동 필요
      console.log('비밀번호 재설정 요청:', { userId, password });
      
      // 시뮬레이션
      setTimeout(() => {
        Alert.alert(
          '변경 완료',
          '비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.',
          [{ text: '확인', onPress: () => navigation.navigate('Login') }]
        );
      }, 1500);
    } catch (error: any) {
      /**
       * [Defense-Log] 백엔드 응답 지연이나 500 에러 발생 시를 대비해 
       * 공통 에러 파서를 통해 사용자에게 안내합니다.
       */
      const message = extractApiErrorMessage(
        error,
        '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
      Alert.alert('오류', message);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 재설정</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(20) : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>새로운 비밀번호를{"\n"}입력해주세요.</Text>
            <Text style={styles.introSub}>대/소문자, 숫자, 특수문자 포함 8~20자로 설정해주세요.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <CustomTextInput
                label="새 비밀번호"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="8~20자 입력 (조합 필수)"
              />
              {password.length > 0 && !isPasswordValid && (
                <Text style={styles.errorText}>* {passwordValidation.message}</Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <CustomTextInput
                label="비밀번호 확인"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="다시 한번 입력"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>* 비밀번호가 일치하지 않습니다.</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.mainButton, !isFormValid && styles.disabledButton]}
              onPress={handleReset}
              disabled={!isFormValid || isSubmitting}
            >
              <Text style={[styles.mainButtonText, !isFormValid && styles.disabledButtonText]}>
                비밀번호 변경하기
              </Text>
            </TouchableOpacity>
          </View>

          {/* [Premium-UI] 네비게이션 바와의 겹침 방지를 위해 동적 여백 추가 */}
          <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56),
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(24), // 기본 여백을 줄이고 동적 여백으로 처리
  },
  introContainer: {
    marginBottom: hp(40),
  },
  introTitle: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(34),
    marginBottom: hp(8),
  },
  introSub: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  formContainer: {
    gap: hp(24),
  },
  inputWrapper: {
    width: '100%',
  },
  errorText: {
    fontSize: fp(12),
    color: '#EF4444',
    marginTop: hp(6),
    marginLeft: wp(4),
    fontFamily: FONTS.medium,
  },
  footer: {
    marginTop: hp(60),
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: COLORS.textTertiary,
  },
});
