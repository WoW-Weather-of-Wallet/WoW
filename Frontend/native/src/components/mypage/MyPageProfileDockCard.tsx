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
  const resolvedName = name?.trim() || '사용자';
  const initial = resolvedName.slice(0, 1);

  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        paddingHorizontal: wp(18),
        paddingVertical: hp(16),
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
      <View className="flex-row items-start">
        <View
          className="items-center justify-center"
          style={{
            width: wp(52),
            height: wp(52),
            borderRadius: wp(26),
            marginRight: wp(12),
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

        <View className="flex-1" style={{ gap: hp(4), justifyContent: 'center' }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1" style={{ paddingRight: wp(10), justifyContent: 'center' }}>
              <Text
                style={{
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
            </View>

            <View
              style={{
                borderRadius: RADIUS.md,
                paddingHorizontal: wp(8),
                paddingVertical: hp(5),
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
        <View className="flex-row items-center" style={{ gap: wp(8), marginTop: hp(2) }}>
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
