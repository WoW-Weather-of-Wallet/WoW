import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { styles } from './FindPwScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import IdentityVerificationForm from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { useRecoverySmsFlow } from '../../hooks';
import type { FindPwRouteParams } from '../../types/auth';
import type { RootRouteProp } from '../../types';
import { validateId } from '../../utils/validation';

export default function FindPwScreen() {
  const route = useRoute<RootRouteProp<'FindPw'>>();
  const routeParams = (route?.params ?? {}) as FindPwRouteParams;
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState(routeParams.prefilledId || '');
  const [showVerification, setShowVerification] = useState(false);
  const {
    isSubmitting,
    termsVisible,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  } = useRecoverySmsFlow({
    flow: 'FindPw',
    fallbackMessage: '인증번호 발송에 실패했어요. 잠시 후 다시 시도해 주세요.',
    buildParams: () => ({
      userId: userId.trim(),
    }),
  });

  React.useEffect(() => {
    if (routeParams.prefilledId) {
      setUserId(routeParams.prefilledId);
    }
  }, [routeParams.prefilledId]);

  const handleIdSubmit = () => {
    const validation = validateId(userId.trim());
    if (validation.isValid) {
      setShowVerification(true);
      return;
    }

    Alert.alert('오류', validation.message);
  };

  const handleUserIdChange = (text: string) => {
    const filtered = text.replace(/[^a-zA-Z0-9]/g, '');
    setUserId(filtered);
  };

  return (
    <>
      <AuthScreenLayout title="비밀번호 찾기">
        <AuthIntroBlock
          title="비밀번호를 찾기 위해 로그인 아이디를 먼저 입력해 주세요."
          description={
            showVerification
              ? '본인 확인이 완료되면 새로운 비밀번호를 설정할 수 있어요.'
              : '가입한 아이디를 확인한 뒤 본인인증을 진행할게요.'
          }
        />
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>아이디</Text>
          <View style={styles.underlineContainer}>
            <TextInput
              style={[styles.bareInput, { letterSpacing: userId.length > 0 ? 1 : 0 }]}
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
          </View>
          {!showVerification && (
            <>
              <Text style={styles.helperText}>* 영문 또는 숫자 조합 4~20자로 입력해 주세요.</Text>
              <TouchableOpacity
                style={[
                  styles.idNextButton,
                  userId.trim().length >= 4 &&
                    userId.trim().length <= 20 &&
                    styles.activeIdNextButton,
                ]}
                onPress={handleIdSubmit}
                disabled={userId.trim().length < 4 || userId.trim().length > 20}
              >
                <Text
                  style={[
                    styles.idNextButtonText,
                    userId.trim().length >= 4 &&
                      userId.trim().length <= 20 &&
                      styles.activeIdNextButtonText,
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
