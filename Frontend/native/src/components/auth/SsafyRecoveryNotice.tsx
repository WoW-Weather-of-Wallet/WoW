import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface SsafyRecoveryNoticeProps {
  onLinkPress: () => void;
}

/**
 * SSAFY 통합 계정 사용자를 위한 안내 컴포넌트입니다.
 * 외부 링크(SSAFY 포털)로 유도하는 하이퍼링크를 포함합니다.
 */
export default function SsafyRecoveryNotice({ onLinkPress }: SsafyRecoveryNoticeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Ionicons 
          name="information-circle-outline" 
          size={wp(20)} 
          color={COLORS.textSecondary} 
          style={styles.infoIcon}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.noticeText}>
            SSAFY 계정으로 가입하신 분은 앱 내에서 직접 찾기를 지원하지 않습니다.
          </Text>
          <TouchableOpacity onPress={onLinkPress} activeOpacity={0.6}>
            <Text style={styles.linkText}>SSAFY 계정으로 로그인/찾기 안내 바로가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(24),
    paddingHorizontal: wp(4),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: wp(16),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoIcon: {
    marginRight: wp(10),
    marginTop: hp(2),
  },
  textWrapper: {
    flex: 1,
  },
  noticeText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(19),
    marginBottom: hp(6),
  },
  linkText: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

