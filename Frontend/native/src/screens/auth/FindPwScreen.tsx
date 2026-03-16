import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';
import CustomTextInput from '../../components/common/CustomTextInput';
import IdentityVerificationForm, { IdentityData } from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { sendSmsCode } from '../../services/auth';

/**
 * FindPwScreen
 * 사용자의 아이디를 먼저 입력받고, 본인인증을 통해 비밀번호를 재설정하는 화면입니다.
 * 아이디 입력 시 특수문자 입력을 제한합니다.
 */
export default function FindPwScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [userId, setUserId] = useState(route.params?.prefilledId || '');
  const [showVerification, setShowVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityData | null>(null);

  // 아이디 찾기 결과에서 넘어온 경우 자동 입력 처리
  React.useEffect(() => {
    if (route.params?.prefilledId) {
      setUserId(route.params.prefilledId);
    }
  }, [route.params?.prefilledId]);

  const handleIdSubmit = () => {
    if (userId.trim().length >= 4 && userId.trim().length <= 20) {
      setShowVerification(true);
    } else {
      Alert.alert('알림', '아이디는 4자 이상 20자 이하로 입력해주세요.');
    }
  };

  const handleComplete = (data: IdentityData) => {
    setPendingData(data);
    setTermsVisible(true);
  };

  const handleTermsConfirm = async () => {
    if (!pendingData) return;
    
    setIsSubmitting(true);
    try {
      // 1. 휴대폰 번호로 인증번호 발송 API 호출
      await sendSmsCode({ phoneNumber: pendingData.phone });
      
      // 2. 인증번호 입력 화면으로 이동
      navigation.navigate('VerifyCode', {
        ...pendingData,
        userId: userId, // 비밀번호 찾기 시 아이디 정보 추가 전달
        flow: 'FindPw'
      });
    } catch (error) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserIdChange = (text: string) => {
    // 특수기호 사용 금지 (이메일 가입 방지 및 보안 정책)
    const filtered = text.replace(/[^a-zA-Z0-9]/g, '');
    setUserId(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 찾기</Text>
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
            <Text style={styles.introTitle}>
              비밀번호 재설정을 위해{"\n"}정보를 입력해주세요.
            </Text>
            <Text style={styles.introSub}>
              {showVerification ? '정보를 모두 입력해주세요.' : '가입하신 아이디를 입력해주세요.'}
            </Text>
          </View>

          {/* 1단계: 아이디 입력 */}
          <View style={styles.inputSection}>
            <CustomTextInput
              label="아이디"
              value={userId}
              onChangeText={handleUserIdChange}
              onSubmitEditing={handleIdSubmit}
              returnKeyType="next"
              autoFocus={!showVerification}
              editable={!showVerification}
            />
            {!showVerification && (
              <>
                <Text style={styles.helperText}>* 영문/숫자 혼합 4~20자 (특수문자 불가)</Text>
                <TouchableOpacity
                  style={[
                    styles.idNextButton,
                    userId.trim().length >= 4 && userId.trim().length <= 20 && styles.activeIdNextButton
                  ]}
                  onPress={handleIdSubmit}
                  disabled={userId.trim().length < 4 || userId.trim().length > 20}
                >
                  <Text style={[
                    styles.idNextButtonText,
                    userId.trim().length >= 4 && userId.trim().length <= 20 && styles.activeIdNextButtonText
                  ]}>
                    확인
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* 2단계: 신원 확인 폼 (아이디 입력 후 노출) */}
          {showVerification && (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.formWrapper}>
              <View style={styles.divider} />
              <IdentityVerificationForm 
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsBottomSheet
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        onConfirm={handleTermsConfirm}
      />
    </SafeAreaView>
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
    paddingBottom: hp(40),
  },
  introContainer: {
    marginBottom: hp(32),
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
  inputSection: {
    marginBottom: hp(24),
  },
  helperText: {
    fontSize: fp(12),
    color: COLORS.textTertiary,
    marginTop: hp(6),
    marginLeft: wp(4),
  },
  idNextButton: {
    marginTop: hp(16),
    backgroundColor: '#F3F4F6',
    paddingVertical: hp(14),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  activeIdNextButton: {
    backgroundColor: COLORS.primary50,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  idNextButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  activeIdNextButtonText: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: hp(24),
  },
  formWrapper: {
    flex: 1,
  },
});

