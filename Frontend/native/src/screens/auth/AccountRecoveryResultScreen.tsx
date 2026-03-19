import React from 'react';
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { styles } from './AccountRecoveryResultScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
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
    ? `${name ?? '입력한 정보'}로 찾은 계정이 없어요`
    : isFail
      ? '입력한 계정 정보가 일치하지 않아요'
      : `${name ?? '계정'}을 찾았어요`;

  const subtitle = isLocal
    ? '입력한 정보와 일치하는 일반 계정을 찾았어요.'
    : isSsafy
      ? '입력한 정보와 연결된 SSAFY 계정을 찾았어요.'
      : isNone
        ? '입력한 정보와 일치하는 계정을 찾지 못했어요.'
        : '입력한 계정 정보가 일치하지 않아요. 다시 확인해 주세요.';

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
            <Text style={styles.resultLabel}>아이디</Text>
            <Text style={styles.resultValue}>{userId}</Text>
          </Animated.View>
        )}

        {isSsafy && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              이 계정은 <Text style={styles.highlight}>SSAFY 로그인</Text>을 사용해요.
            </Text>
            <Text style={styles.noticeSubText}>
              일반 비밀번호 재설정 대신 SSAFY 로그인 흐름으로 진행해 주세요.
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={handleSsafyLink}>
              <Text style={styles.linkButtonText}>SSAFY 로그인으로 이동</Text>
              <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {isNone && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              아직 계정이 없다면 회원가입을 진행할 수 있어요.
            </Text>
          </Animated.View>
        )}

        {isFail && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              본인 확인 정보를 다시 확인한 뒤 계정 찾기를 다시 진행해 주세요.
            </Text>
          </Animated.View>
        )}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
          {isLocal && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindPw}>
              <Text style={styles.secondaryButtonText}>비밀번호도 다시 설정할까요?</Text>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          )}

          {isFail && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToFindId}>
              <Text style={styles.secondaryButtonText}>아이디부터 다시 확인할까요?</Text>
              <Text style={styles.linkText}>아이디 찾기</Text>
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
              {isNone ? '회원가입으로 이동' : isFail ? '다시 시도' : '로그인으로 이동'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


