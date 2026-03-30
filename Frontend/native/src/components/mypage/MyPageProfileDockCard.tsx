import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPageProfileDockCardProps {
  name: string;
  clusterLabel?: string | null;
  isLoading: boolean;
}

export default function MyPageProfileDockCard({
  name,
  clusterLabel,
  isLoading,
}: MyPageProfileDockCardProps) {
  const resolvedName = name?.trim() || '사용자';
  const initial = resolvedName.slice(0, 1);
  const resolvedClusterLabel = clusterLabel?.trim() || 'AI 분석 대기';

  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        paddingHorizontal: wp(18),
        paddingVertical: hp(14),
        gap: hp(8),
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.035,
        shadowRadius: 14,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-center" style={{ gap: wp(12) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(52),
            height: wp(52),
            borderRadius: wp(26),
            backgroundColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
          >
            {initial}
          </Text>
        </View>

        <View className="flex-1 flex-row items-center" style={{ gap: wp(8) }}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.extraBold,
                color: COLORS.primaryDark,
              }}
            >
              {resolvedName}
            </Text>
            님
          </Text>

          <View
            className="flex-row items-center"
            style={{
              gap: wp(4),
              borderRadius: RADIUS.full,
              paddingHorizontal: wp(10),
              paddingVertical: hp(6),
              backgroundColor: COLORS.aiBadgeBackground,
            }}
          >
            <Ionicons name="sparkles-outline" size={wp(13)} color={COLORS.primary} />
            <Text
              numberOfLines={1}
              style={{
                fontSize: fp(11),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary,
              }}
            >
              {resolvedClusterLabel}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-row items-center justify-center" style={{ gap: wp(8), marginTop: hp(2) }}>
          <ActivityIndicator color={COLORS.primary} />
          <Text
            style={{
              fontSize: fp(12),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            정보를 불러오고 있어요...
          </Text>
        </View>
      ) : null}
    </View>
  );
}
