import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp, COLORS, FONTS } from '../../constants/theme';
import IdentityVerificationForm, { IdentityData } from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { sendSmsCode } from '../../services/auth';

/**
 * FindIdScreen
 * 사용자의 이름을 포함한 본인인증 정보를 통해 아이디를 찾는 화면입니다.
 * 재사용 가능한 IdentityVerificationForm을 활용합니다.
 */
export default function FindIdScreen() {
  const navigation = useNavigation<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityData | null>(null);

  const handleComplete = (data: IdentityData) => {
    // 폼 입력 완료 시 약관 동의 모달 노출
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
        flow: 'FindId' // 아이디 찾기 흐름임을 명시
      });
    } catch (error) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.introTitle}>아이디를 찾기 위해{"\n"}정보를 입력해주세요.</Text>
            <Text style={styles.introSub}>본인 확인을 위한 절차입니다.</Text>
          </View>

          <IdentityVerificationForm 
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
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

