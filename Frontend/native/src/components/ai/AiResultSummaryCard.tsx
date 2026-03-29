import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { ResponsiveLayoutMode } from '../../hooks/useResponsiveLayoutMode';

export interface AiResultSummaryCardProps {
  title: string;
  description: string;
  headline?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  iconText?: string;
  items?: string[];
  layoutMode?: ResponsiveLayoutMode;
}

export default function AiResultSummaryCard({
  title,
  description,
  headline,
  iconName,
  iconText,
  items,
  layoutMode,
}: AiResultSummaryCardProps) {
  const { height } = useWindowDimensions();
  const resolvedLayoutMode = layoutMode ?? (height < 760 ? 'compact' : 'regular');
  const isCompactHeight = resolvedLayoutMode === 'compact';
  const isTallHeight = resolvedLayoutMode === 'tall';

  return (
    <View
      className="bg-white"
      style={{
        borderRadius: RADIUS.xxl,
        padding: isCompactHeight ? wp(18) : isTallHeight ? wp(21) : wp(20),
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
      }}
    >
      <Text
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
