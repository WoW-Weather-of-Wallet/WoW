import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export interface AiResultSummaryCardProps {
  title: string;
  description: string;
  headline?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  iconText?: string;
  items?: string[];
}

export default function AiResultSummaryCard({
  title,
  description,
  headline,
  iconName,
  iconText,
  items,
}: AiResultSummaryCardProps) {
  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        padding: wp(20),
        marginBottom: hp(24),
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
      }}
    >
      <Text
        className="text-[#15192A]"
        style={{
          fontSize: fp(18),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
          marginBottom: hp(16),
        }}
      >
        {title}
      </Text>

      {headline ? (
        <Text
          className="text-[#15192A]"
          style={{
            fontSize: fp(18),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {headline}
        </Text>
      ) : null}

      {iconName && iconText ? (
        <View className="flex-row items-center">
          <Ionicons name={iconName} size={wp(20)} color={COLORS.primary} />
          <Text
            className="text-[#15192A]"
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.textPrimary,
              marginLeft: wp(8),
            }}
          >
            {iconText}
          </Text>
        </View>
      ) : null}

      <Text
        className="text-[#6B7280]"
        style={{
          fontSize: fp(14),
          fontFamily: FONTS.regular,
          color: COLORS.textSecondary,
          lineHeight: fp(20),
          marginTop: hp(8),
        }}
      >
        {description}
      </Text>

      {items?.length ? (
        <View style={{ marginTop: hp(14), gap: hp(10) }}>
          {items.map((item, index) => (
            <View
              key={`${title}-${index}`}
              style={{ flexDirection: 'row', alignItems: 'flex-start' }}
            >
              <View
                style={{
                  width: wp(6),
                  height: wp(6),
                  borderRadius: wp(3),
                  backgroundColor: COLORS.primary,
                  marginTop: hp(7),
                  marginRight: wp(10),
                }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: fp(13),
                  fontFamily: FONTS.medium,
                  color: COLORS.textPrimary,
                  lineHeight: fp(20),
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
