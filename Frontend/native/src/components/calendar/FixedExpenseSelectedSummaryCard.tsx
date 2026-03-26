import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { FixedExpenseDetailItem } from '../../hooks';

interface FixedExpenseSelectedSummaryCardProps {
  item: FixedExpenseDetailItem;
}

export default function FixedExpenseSelectedSummaryCard({
  item,
}: FixedExpenseSelectedSummaryCardProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.fixedExpenseDetailSelectedBackground,
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
        marginBottom: hp(16),
      }}
    >
      <View className="flex-row items-center" style={{ gap: wp(12) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(42),
            height: wp(42),
            borderRadius: wp(16),
            backgroundColor: item.iconTone,
          }}
        >
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={wp(18)}
            color={item.iconTone === '#111111' ? COLORS.white : COLORS.textPrimary}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(4),
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.spentRed,
            }}
          >
            {`-${item.amount.toLocaleString()}\uC6D0`}
          </Text>
        </View>
      </View>
      <Ionicons name="pin" size={wp(18)} color={COLORS.primary} />
    </View>
  );
}
