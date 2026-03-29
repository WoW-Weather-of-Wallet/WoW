import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPageProfileDockCardProps {
  name: string;
  badgeLabel: string;
  userId?: string | null;
  phoneLabel?: string | null;
  isLoading: boolean;
}

export default function MyPageProfileDockCard({
  name,
  badgeLabel,
  userId,
  phoneLabel,
  isLoading,
}: MyPageProfileDockCardProps) {
  const resolvedName = name?.trim() || '사용자';
  const initial = resolvedName.slice(0, 1);
  const resolvedUserId = userId?.trim() || '아이디 정보 없음';
  const resolvedPhoneLabel = phoneLabel?.trim() || '휴대폰 정보 없음';

  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        paddingHorizontal: wp(18),
        paddingVertical: hp(18),
        gap: hp(10),
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
            width: wp(56),
            height: wp(56),
            borderRadius: wp(28),
            marginRight: wp(14),
            backgroundColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              fontSize: fp(22),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
          >
            {initial}
          </Text>
        </View>

        <View className="flex-1" style={{ gap: hp(5) }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1" style={{ paddingRight: wp(10) }}>
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

              <Text
                numberOfLines={1}
                style={{
                  marginTop: hp(2),
                  fontSize: fp(13),
                  lineHeight: fp(18),
                  fontFamily: FONTS.medium,
                  color: COLORS.textSecondary,
                }}
              >
                {resolvedUserId}
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

          <View className="flex-row items-center" style={{ gap: wp(6) }}>
            <View
              className="flex-row items-center"
              style={{
                borderRadius: RADIUS.full,
                paddingHorizontal: wp(10),
                paddingVertical: hp(6),
                backgroundColor: COLORS.primary50,
                maxWidth: '100%',
              }}
            >
              <Ionicons
                name="call-outline"
                size={wp(14)}
                color={COLORS.primary}
              />
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: wp(6),
                  fontSize: fp(12),
                  lineHeight: fp(17),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.primaryDark,
                  flexShrink: 1,
                }}
              >
                {resolvedPhoneLabel}
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
