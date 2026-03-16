import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';
import { getSsafyLoginUrl } from '../../services/auth';

/**
 * RecoveryResultScreen
 * 아이디 찾기 인증 성공 후 결과를 보여주는 화면입니다.
 * - SSAFY 가입자: SSAFY 포털 안내
 * - 로컬 가입자: 아이디 표시 및 비밀번호 찾기 링크 제공
 * - 미가입자: 가입 안내
 */
export default function RecoveryResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { name, userId, userType } = route.params || {};

  // userType: 'local', 'ssafy', 'none', 'fail'
  const isSsafy = userType === 'ssafy';
  const isLocal = userType === 'local';
  const isNone = userType === 'none'; // Find ID result: Account doesn't exist
  const isFail = userType === 'fail'; // Find PW result: ID and Info don't match

  const handleSsafyLink = () => {
    Linking.openURL(getSsafyLoginUrl());
  };

  const handleGoToFindPw = () => {
    // 찾은 아이디를 가지고 비밀번호 찾기 화면으로 이동 (수정 가능하게 전달)
    navigation.navigate('FindPw', { prefilledId: userId });
  };

  const handleGoToFindId = () => {
    navigation.navigate('FindId');
  };

  const handleRetry = () => {
    navigation.navigate('FindPw');
  };

  const handleGoToSignup = () => {
    navigation.navigate('PhoneAuth'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.iconWrapper}>
          <View style={[styles.iconCircle, (isNone || isFail) && styles.iconCircleNone]}>
            <Ionicons 
              name={isNone || isFail ? "search-outline" : "person-circle"} 
              size={wp(60)} 
              color={isNone || isFail ? COLORS.textTertiary : COLORS.primary} 
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.textSection}>
          <Text style={styles.title}>
            {isNone ? `${name}님,` : isFail ? '죄송합니다.' : `${name}님의`}
          </Text>
          <Text style={styles.subtitle}>
            {isLocal && '가입된 계정 정보를 확인해주세요.'}
            {isSsafy && '계정 정보를 확인해주세요.'}
            {isNone && '이름으로 가입된 계정이 없습니다.'}
            {isFail && '일치하는 계정 정보가 없습니다.'}
          </Text>
        </Animated.View>

        {isLocal && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.resultBox}>
            <Text style={styles.resultLabel}>아이디</Text>
            <Text style={styles.resultValue}>{userId}</Text>
          </Animated.View>
        )}

        {isSsafy && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              {name}님은 <Text style={styles.highlight}>SSAFY</Text>를 통해 가입하신 상태입니다.
            </Text>
            <Text style={styles.noticeSubText}>
              보안 정책상 아이디를 직접 보여드리지 않으며, 자세한 내용은 SSAFY 계정 관리 페이지를 참고해주세요.
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={handleSsafyLink}>
              <Text style={styles.linkButtonText}>SSAFY 계정 관리 바로가기</Text>
              <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {isNone && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              앗, 아직 회원이 아니신가요?{"\n"}지금 바로 회원가입을 진행해보세요.
            </Text>
          </Animated.View>
        )}

        {isFail && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              입력하신 정보와 일치하는 계정을 찾을 수 없습니다.{"\n"}정보를 다시 확인하거나 아이디 찾기를 진행해주세요.
            </Text>
          </Animated.View>
        )}

        <View style={styles.footer}>
          {isLocal && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindPw}>
              <Text style={styles.secondaryButtonText}>비밀번호도 잊으셨나요?</Text>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          )}

          {isFail && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindId}>
              <Text style={styles.secondaryButtonText}>아이디가 기억나지 않으시나요?</Text>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={
              isNone ? handleGoToSignup : 
              isFail ? handleRetry :
              () => navigation.navigate('Login')
            }
          >
            <Text style={styles.mainButtonText}>
              {isNone ? '회원가입 하러가기' : isFail ? '다시 시도하기' : '로그인하러 가기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: hp(56),
    justifyContent: 'center',
    paddingHorizontal: wp(16),
  },
  backButton: {
    padding: wp(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(24),
    alignItems: 'center',
    paddingTop: hp(40),
  },
  iconWrapper: {
    marginBottom: hp(32),
  },
  iconCircle: {
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: COLORS.primary + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleNone: {
    backgroundColor: '#F3F4F6',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: hp(48),
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.xl,
    padding: wp(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  noticeBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.xl,
    padding: wp(24),
  },
  noticeText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
  },
  highlight: {
    color: COLORS.primary,
  },
  noticeSubText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(22),
    marginBottom: hp(20),
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: wp(4),
    textDecorationLine: 'underline',
  },
  emptyBox: {
    width: '100%',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(24),
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: hp(24),
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(20),
    gap: wp(8),
  },
  secondaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
