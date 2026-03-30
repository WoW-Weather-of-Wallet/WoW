import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import IdentityVerificationForm from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import AuthUnderlineInput from '../../components/common/AuthUnderlineInput';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useFindPwFlow } from '../../hooks';

export default function FindPwScreen() {
  const insets = useSafeAreaInsets();
  const {
    userId,
    showVerification,
    isSubmitting,
    termsVisible,
    isNextEnabled,
    introDescription,
    helperText,
    handleUserIdChange,
    handleIdSubmit,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  } = useFindPwFlow();

  return (
    <>
      <AuthScreenLayout title="비밀번호 찾기">
        <AuthIntroBlock
          title="비밀번호를 찾을 아이디를 먼저 입력해 주세요"
          description={introDescription}
        />

        <View style={{ marginBottom: hp(24) }}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.textTertiary,
              marginBottom: hp(10),
              marginLeft: wp(4),
            }}
          >
            아이디
          </Text>

          <AuthUnderlineInput
            containerStyle={{
              borderBottomWidth: 1.5,
              borderBottomColor: COLORS.textPrimary,
              paddingVertical: hp(8),
              minHeight: hp(50),
              justifyContent: 'center',
            }}
            inputStyle={[
              {
                fontSize: fp(24),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                padding: 0,
                margin: 0,
              },
              { letterSpacing: userId.length > 0 ? 1 : 0 },
            ]}
            value={userId}
            onChangeText={handleUserIdChange}
            placeholder="아이디를 입력해 주세요"
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={handleIdSubmit}
            returnKeyType="next"
            autoFocus={!showVerification}
            editable={!showVerification}
            autoCapitalize="none"
          />

          {!showVerification ? (
            <>
              <Text
                style={{
                  fontSize: fp(12),
                  color: COLORS.textTertiary,
                  marginTop: hp(6),
                  marginLeft: wp(4),
                }}
              >
                {helperText}
              </Text>

              <TouchableOpacity
                className="items-center"
                style={{
                  marginTop: hp(16),
                  backgroundColor: isNextEnabled
                    ? COLORS.primary50
                    : COLORS.gray100,
                  paddingVertical: hp(14),
                  borderRadius: RADIUS.xl,
                  borderWidth: isNextEnabled ? 1 : 0,
                  borderColor: isNextEnabled
                    ? COLORS.primarySoft
                    : 'transparent',
                }}
                onPress={handleIdSubmit}
                disabled={!isNextEnabled}
              >
                <Text
                  style={{
                    fontSize: fp(14),
                    fontFamily: FONTS.bold,
                    color: isNextEnabled ? COLORS.primary : COLORS.textTertiary,
                  }}
                >
                  다음
                </Text>
              </TouchableOpacity>

              <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
            </>
          ) : null}
        </View>

        {showVerification ? (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={{ flex: 1 }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.gray100,
                marginVertical: hp(24),
              }}
            />

            <IdentityVerificationForm
              onComplete={handleIdentityComplete}
              isSubmitting={isSubmitting}
            />
          </Animated.View>
        ) : null}
      </AuthScreenLayout>

      <TermsBottomSheet
        visible={termsVisible}
        flow="FindPw"
        onClose={handleTermsClose}
        onConfirm={handleTermsConfirm}
      />
    </>
  );
}
