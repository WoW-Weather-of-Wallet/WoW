import React from 'react';
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { styles } from './AccountRecoveryResultScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
import { useAccountRecoveryResult } from '../../hooks';

export default function AccountRecoveryResultScreen() {
  const insets = useSafeAreaInsets();
  const {
    name,
    userId,
    isSsafy,
    isLocal,
    isNone,
    isFail,
    title,
    subtitle,
    secondaryAction,
    mainAction,
    handleClose,
    handleSsafyLink,
  } = useAccountRecoveryResult();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
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
              해당 계정은 <Text style={styles.highlight}>SSAFY 로그인</Text>으로 이용할 수 있어요.
            </Text>
            <Text style={styles.noticeSubText}>
              비밀번호 재설정 대신 SSAFY 계정으로 로그인해 주세요.
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={handleSsafyLink}>
              <Text style={styles.linkButtonText}>SSAFY 로그인 하러가기</Text>
              <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {isNone && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              기존 계정이 없다면 회원가입을 진행해 주세요.
            </Text>
          </Animated.View>
        )}

        {isFail && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              입력한 정보가 맞는지 다시 확인하고 시도해 주세요.
            </Text>
          </Animated.View>
        )}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
          {secondaryAction && (
            <TouchableOpacity style={styles.secondaryButton} onPress={secondaryAction.onPress}>
              <Text style={styles.secondaryButtonText}>{secondaryAction.description}</Text>
              <Text style={styles.linkText}>{secondaryAction.linkLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.mainButton}
            onPress={mainAction.onPress}
          >
            <Text style={styles.mainButtonText}>
              {mainAction.label}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
