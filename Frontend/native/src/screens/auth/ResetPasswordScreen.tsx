import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import CustomTextInput from '../../components/common/CustomTextInput';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useResetPasswordFlow } from '../../hooks';

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
        title="새 비밀번호를 입력해 주세요"
        description="영문, 숫자, 특수문자를 포함한 8자 이상 비밀번호를 설정할 수 있어요."
        marginBottom={hp(40)}
      />

      <View style={{ gap: hp(24) }}>
        <View className="w-full">
          <CustomTextInput
            label="새 비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="새 비밀번호를 입력해 주세요"
          />
          {showPasswordError ? (
            <Text
              style={{
                fontSize: fp(12),
                color: COLORS.error,
                marginTop: hp(6),
                marginLeft: wp(4),
                fontFamily: FONTS.medium,
              }}
            >
              {passwordErrorMessage}
            </Text>
          ) : null}
        </View>

        <View className="w-full">
          <CustomTextInput
            label="비밀번호 확인"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="비밀번호를 한 번 더 입력해 주세요"
          />
          {showMismatchError ? (
            <Text
              style={{
                fontSize: fp(12),
                color: COLORS.error,
                marginTop: hp(6),
                marginLeft: wp(4),
                fontFamily: FONTS.medium,
              }}
            >
              {mismatchErrorMessage}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ marginTop: hp(60) }}>
        <TouchableOpacity
          className="items-center"
          style={{
            backgroundColor: isResetDisabled ? COLORS.gray100 : COLORS.primary,
            borderRadius: wp(30),
            paddingVertical: hp(18),
          }}
          onPress={() => void handleReset()}
          disabled={isResetDisabled}
        >
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: isResetDisabled ? COLORS.textTertiary : COLORS.textInverse,
            }}
          >
            비밀번호 변경하기
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
    </AuthScreenLayout>
  );
}
