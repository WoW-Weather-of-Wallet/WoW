import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { styles } from './FindPwScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import IdentityVerificationForm from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import AuthUnderlineInput from '../../components/common/AuthUnderlineInput';
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
          title="비밀번호를 찾기 위해 로그인 아이디를 먼저 입력해 주세요."
          description={introDescription}
        />
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>아이디</Text>
          <AuthUnderlineInput
            containerStyle={styles.underlineContainer}
            inputStyle={[styles.bareInput, { letterSpacing: userId.length > 0 ? 1 : 0 }]}
            value={userId}
            onChangeText={handleUserIdChange}
            placeholder="로그인 아이디를 입력해 주세요"
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={handleIdSubmit}
            returnKeyType="next"
            autoFocus={!showVerification}
            editable={!showVerification}
            autoCapitalize="none"
          />
          {!showVerification && (
            <>
              <Text style={styles.helperText}>{helperText}</Text>
              <TouchableOpacity
                style={[
                  styles.idNextButton,
                  isNextEnabled && styles.activeIdNextButton,
                ]}
                onPress={handleIdSubmit}
                disabled={!isNextEnabled}
              >
                <Text
                  style={[
                    styles.idNextButtonText,
                    isNextEnabled && styles.activeIdNextButtonText,
                  ]}
                >
                  다음
                </Text>
              </TouchableOpacity>

              <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
            </>
          )}
        </View>

        {showVerification && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.formWrapper}>
            <View style={styles.divider} />
            <IdentityVerificationForm
              onComplete={handleIdentityComplete}
              isSubmitting={isSubmitting}
            />
          </Animated.View>
        )}
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
