import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPageProfileDockCardProps {
  name: string;
  badgeLabel: string;
  isLoading: boolean;
}

export default function MyPageProfileDockCard({
  name,
  badgeLabel,
  isLoading,
}: MyPageProfileDockCardProps) {
  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        padding: wp(20),
        gap: hp(18),
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        shadowColor: COLORS.textPrimary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="items-center justify-center"
          style={{
            width: wp(68),
            height: wp(68),
            borderRadius: wp(34),
            marginRight: wp(16),
            backgroundColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              fontSize: fp(28),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
          >
            {name.slice(0, 1)}
          </Text>
        </View>

        <View className="flex-1" style={{ gap: hp(6) }}>
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                fontSize: fp(22),
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
                {name}
              </Text>
              님
            </Text>

            <View
              style={{
                borderRadius: RADIUS.md,
                paddingHorizontal: wp(8),
                paddingVertical: hp(4),
                backgroundColor: COLORS.primarySoft,
              }}
            >
              <Text
                style={{
                  fontSize: fp(11),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary,
                }}
              >
                {badgeLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-row items-center" style={{ gap: wp(8), marginTop: hp(10) }}>
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
