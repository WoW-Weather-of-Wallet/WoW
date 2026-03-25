import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './ResetPasswordScreen.styles';
import { hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import CustomTextInput from '../../components/common/CustomTextInput';
import { findPassword } from '../../services/auth';
import {
  buildBirthDateFromIdentity,
  buildGenderFromIdentity,
} from '../../utils/authIdentity';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { validatePassword } from '../../utils/validation';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userId, name, ssnFront, ssnBack, phoneNumber } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValidation = validatePassword(password, userId);
  const isPasswordValid = passwordValidation.isValid;
  const isFormValid =
    isPasswordValid &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  const handleReset = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const birthDate = buildBirthDateFromIdentity(ssnFront, ssnBack);
      const gender = buildGenderFromIdentity(ssnBack);

      if (!birthDate || !gender || !name || !phoneNumber) {
        throw new Error('본인 확인 정보가 누락되었어요.');
      }

      // 비밀번호 재설정은 문자 인증이 끝난 뒤에만 요청합니다.
      await findPassword({
        userId,
        name,
        birthDate,
        gender,
        phoneNumber,
        newPw: password,
      });

      Alert.alert(
        '비밀번호 변경 완료',
        '새 비밀번호가 저장되었어요. 다시 로그인해 주세요.',
        [{ text: '확인', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'password-reset',
        fallbackMessage: '비밀번호 변경에 실패했어요. 다시 시도해 주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout title="비밀번호 재설정" scrollContentStyle={{ paddingBottom: hp(24) }}>
      <AuthIntroBlock
        title="새 비밀번호를 입력해주세요."
        description="영문, 숫자, 특수문자를 포함한 8~20자로 설정해 주세요."
        marginBottom={hp(40)}
      />
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <CustomTextInput
            label="새 비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="새 비밀번호 입력"
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
            placeholder="비밀번호를 다시 입력해주세요"
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={styles.errorText}>* 비밀번호가 일치하지 않아요.</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainButton, !isFormValid && styles.disabledButton]}
          onPress={() => void handleReset()}
          disabled={!isFormValid || isSubmitting}
        >
          <Text style={[styles.mainButtonText, !isFormValid && styles.disabledButtonText]}>
            비밀번호 변경하기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 하단 시스템 영역과 겹치지 않도록 동적 여백을 추가합니다. */}
      <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
    </AuthScreenLayout>
  );
}
