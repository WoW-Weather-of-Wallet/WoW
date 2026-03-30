import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export interface SelectableTransactionItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

interface FixedExpensePickerRowProps {
  item: SelectableTransactionItem;
  isSelected: boolean;
  onPress: (id: string) => void;
}

export default function FixedExpensePickerRow({
  item,
  isSelected,
  onPress,
}: FixedExpensePickerRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      className="flex-row items-center justify-between"
      style={{
        borderRadius: RADIUS.xl,
        paddingHorizontal: wp(12),
        paddingVertical: hp(14),
        backgroundColor: isSelected
          ? COLORS.pickerRowSelectedBackground
          : 'transparent',
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? COLORS.pickerRowSelectedBorder : 'transparent',
      }}
      onPress={() => onPress(item.id)}
    >
      <View className="flex-1 flex-row items-center" style={{ gap: wp(12) }}>
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
              fontSize: fp(12),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            {`${item.category} / ${item.dateLabel}`}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.bold,
          color: COLORS.spentRed,
        }}
      >
        {`-${item.amount.toLocaleString()}\uC6D0`}
      </Text>
    </TouchableOpacity>
  );
}
