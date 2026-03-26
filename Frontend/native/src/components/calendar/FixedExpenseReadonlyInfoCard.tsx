import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface FixedExpenseReadonlyInfoCardProps {
  title: string;
  category: string;
}

export default function FixedExpenseReadonlyInfoCard({
  title,
  category,
}: FixedExpenseReadonlyInfoCardProps) {
  return (
    <View
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: wp(16),
        paddingVertical: hp(6),
        marginBottom: hp(18),
      }}
    >
      <View
        className="flex-row items-center justify-between"
        style={{ paddingVertical: hp(10), gap: wp(12) }}
      >
        <Text
          style={{
            fontSize: fp(13),
            fontFamily: FONTS.semiBold,
            color: COLORS.textSecondary,
          }}
        >
          {'\uD56D\uBAA9\uBA85'}
        </Text>
        <Text
          style={{
            flex: 1,
            textAlign: 'right',
            fontSize: fp(14),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ height: 1, backgroundColor: COLORS.border }} />
      <View
        className="flex-row items-center justify-between"
        style={{ paddingVertical: hp(10), gap: wp(12) }}
      >
        <Text
          style={{
            fontSize: fp(13),
            fontFamily: FONTS.semiBold,
            color: COLORS.textSecondary,
          }}
        >
          {'\uCE74\uD14C\uACE0\uB9AC'}
        </Text>
        <Text
          style={{
            flex: 1,
            textAlign: 'right',
            fontSize: fp(14),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {category}
        </Text>
      </View>
    </View>
  );
}
