import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import CustomTextInput from '../../components/common/CustomTextInput';
import { useResetPasswordFlow } from '../../hooks';
import { hp } from '../../constants/theme';
import { styles } from './ResetPasswordScreen.styles';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const {
    password,
    confirmPassword,
    showPasswordError,
    showMismatchError,
    isResetDisabled,
    passwordErrorMessage,
    mismatchErrorMessage,
    setPassword,
    setConfirmPassword,
    handleReset,
  } = useResetPasswordFlow();

  return (
    <AuthScreenLayout
      title="비밀번호 재설정"
      scrollContentStyle={{ paddingBottom: hp(24) }}
    >
      <AuthIntroBlock
        title="새 비밀번호를 입력해 주세요."
        description="영문, 숫자, 특수문자를 포함한 8자 이상 비밀번호를 설정해 주세요."
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
          {showPasswordError && <Text style={styles.errorText}>{passwordErrorMessage}</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <CustomTextInput
            label="비밀번호 확인"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="비밀번호를 다시 입력해 주세요"
          />
          {showMismatchError && <Text style={styles.errorText}>{mismatchErrorMessage}</Text>}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mainButton, isResetDisabled && styles.disabledButton]}
          onPress={() => void handleReset()}
          disabled={isResetDisabled}
        >
          <Text
            style={[
              styles.mainButtonText,
              isResetDisabled && styles.disabledButtonText,
            ]}
          >
            비밀번호 재설정하기
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
    </AuthScreenLayout>
  );
}
