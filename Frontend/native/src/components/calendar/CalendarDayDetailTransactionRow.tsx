import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { CalendarTransactionItem } from '../../mock/calendar';

interface CalendarDayDetailTransactionRowProps {
  item: CalendarTransactionItem;
}

export default function CalendarDayDetailTransactionRow({
  item,
}: CalendarDayDetailTransactionRowProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingVertical: hp(10) }}
    >
      <View className="flex-row items-center" style={{ gap: wp(12) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(40),
            height: wp(40),
            borderRadius: wp(16),
            backgroundColor: item.iconTone,
          }}
        >
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={wp(18)}
            color={COLORS.textPrimary}
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
              fontSize: fp(13),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            {item.category}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontSize: fp(16),
          fontFamily: FONTS.bold,
          color: COLORS.spentRed,
        }}
      >
        {`-${item.amount.toLocaleString()}\uC6D0`}
      </Text>
    </View>
  );
}
