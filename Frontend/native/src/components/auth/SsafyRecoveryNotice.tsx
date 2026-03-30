import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface SsafyRecoveryNoticeProps {
  onLinkPress: () => void;
}

export default function SsafyRecoveryNotice({
  onLinkPress,
}: SsafyRecoveryNoticeProps) {
  return (
    <View
      className="mt-6"
      style={{ paddingHorizontal: wp(4) }}
    >
      <View
        className="flex-row border"
        style={{
          backgroundColor: COLORS.gray50,
          padding: wp(16),
          borderRadius: RADIUS.lg,
          borderColor: COLORS.border,
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={wp(20)}
          color={COLORS.textSecondary}
          style={{ marginRight: wp(10), marginTop: hp(2) }}
        />

        <View className="flex-1">
          <Text
            style={{
              fontSize: fp(13),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
              lineHeight: fp(19),
              marginBottom: hp(6),
            }}
          >
            SSAFY 계정은 SSAFY 포털에서만 아이디를 찾을 수 있어요.
          </Text>

          <TouchableOpacity onPress={onLinkPress} activeOpacity={0.6}>
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
                textDecorationLine: 'underline',
              }}
            >
              SSAFY 계정 아이디 찾기 바로가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
