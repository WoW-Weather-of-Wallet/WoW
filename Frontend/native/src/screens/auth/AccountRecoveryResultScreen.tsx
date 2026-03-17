import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';
import { getSsafyLoginUrl } from '../../services/auth';

export default function AccountRecoveryResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { name, userId, userType } = route.params || {};

  const isSsafy = userType === 'ssafy';
  const isLocal = userType === 'local';
  const isNone = userType === 'none';
  const isFail = userType === 'fail';

  const handleSsafyLink = () => {
    Linking.openURL(getSsafyLoginUrl());
  };

  const handleGoToFindPw = () => {
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

  const title = isNone
    ? `${name ?? 'No'} account found`
    : isFail
      ? 'Account information did not match'
      : `${name ?? 'Account'} found`;

  const subtitle = isLocal
    ? 'We found a regular account that matches the information you entered.'
    : isSsafy
      ? 'We found an SSAFY account linked to the information you entered.'
      : isNone
        ? 'No account matched the information you entered.'
        : 'The account details did not match. Please review the information and try again.';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.iconWrapper}>
          <View style={[styles.iconCircle, (isNone || isFail) && styles.iconCircleNone]}>
            <Ionicons
              name={isNone || isFail ? 'search-outline' : 'person-circle'}
              size={wp(60)}
              color={isNone || isFail ? COLORS.textTertiary : COLORS.primary}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.textSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>

        {isLocal && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.resultBox}>
            <Text style={styles.resultLabel}>User ID</Text>
            <Text style={styles.resultValue}>{userId}</Text>
          </Animated.View>
        )}

        {isSsafy && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              This account uses <Text style={styles.highlight}>SSAFY login</Text>.
            </Text>
            <Text style={styles.noticeSubText}>
              Continue with the SSAFY sign-in flow instead of resetting a local password.
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={handleSsafyLink}>
              <Text style={styles.linkButtonText}>Go to SSAFY sign in</Text>
              <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {isNone && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              If you do not have an account yet, you can continue to sign up.
            </Text>
          </Animated.View>
        )}

        {isFail && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Please double-check the identity information and try the recovery flow again.
            </Text>
          </Animated.View>
        )}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
          {isLocal && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindPw}>
              <Text style={styles.secondaryButtonText}>Need to reset the password?</Text>
              <Text style={styles.linkText}>Find Password</Text>
            </TouchableOpacity>
          )}

          {isFail && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindId}>
              <Text style={styles.secondaryButtonText}>Need to recover the user ID first?</Text>
              <Text style={styles.linkText}>Find ID</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.mainButton}
            onPress={
              isNone ? handleGoToSignup
                : isFail ? handleRetry
                  : () => navigation.navigate('Login')
            }
          >
            <Text style={styles.mainButtonText}>
              {isNone ? 'Go to Sign Up' : isFail ? 'Try Again' : 'Go to Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    backgroundColor: `${COLORS.primary}10`,
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
    marginBottom: hp(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(24),
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
