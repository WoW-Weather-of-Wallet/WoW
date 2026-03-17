import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp, COLORS, FONTS } from '../../constants/theme';
import IdentityVerificationForm, { IdentityData } from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { sendSmsCode } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

export default function FindIdScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityData | null>(null);

  const handleComplete = (data: IdentityData) => {
    setPendingData(data);
    setTermsVisible(true);
  };

  const handleTermsConfirm = async () => {
    if (!pendingData) {
      return;
    }

    setIsSubmitting(true);
    try {
      // SMS verification is the common first step before calling the recovery API.
      await sendSmsCode({ phoneNumber: pendingData.phone });

      // The next screen reuses this identity payload to call find-id safely.
      navigation.navigate('VerifyCode', {
        ...pendingData,
        flow: 'FindId',
      });
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '인증번호 발송에 실패했어요. 다시 시도해 주세요.',
      );
      Alert.alert('오류', message);
    } finally {
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
        <Text style={styles.headerTitle}>아이디 찾기</Text>
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
          <Text style={styles.introTitle}>본인 확인 후 아이디를 찾을 수 있어요.</Text>
          <Text style={styles.introSub}>입력한 정보는 다음 단계의 계정 조회에 사용돼요.</Text>
        </View>

          <IdentityVerificationForm
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsBottomSheet
        visible={termsVisible}
        flow="FindId"
        onClose={() => setTermsVisible(false)}
        onConfirm={handleTermsConfirm}
      />
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
    paddingBottom: hp(40),
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
});
