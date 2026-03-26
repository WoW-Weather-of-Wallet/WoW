import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CALENDAR_ENTRY_CATEGORY_GROUPS,
  type CalendarEntryCategoryKey,
} from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface CalendarCategorySelectorProps {
  variant: 'chip' | 'card';
  selectedCategory?: CalendarEntryCategoryKey | null;
  onSelect: (category: CalendarEntryCategoryKey) => void;
}

export default function CalendarCategorySelector({
  variant,
  selectedCategory = null,
  onSelect,
}: CalendarCategorySelectorProps) {
  return (
    <View style={{ gap: hp(12) }}>
      {CALENDAR_ENTRY_CATEGORY_GROUPS.map((group) => (
        <View key={group.key} style={{ gap: hp(8) }}>
          <Text
            style={{
              fontSize: fp(13),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
            }}
          >
            {group.label}
          </Text>
          <View
            className="flex-row flex-wrap"
            style={{ gap: variant === 'chip' ? wp(10) : wp(12) }}
          >
            {group.items.map((category) => {
              const isActive = selectedCategory === category.key;
              const isChip = variant === 'chip';

              return (
                <TouchableOpacity
                  key={category.key}
                  activeOpacity={0.88}
                  className="items-center justify-center"
                  style={{
                    width: isChip ? undefined : '31%',
                    minWidth: isChip ? wp(78) : undefined,
                    minHeight: isChip ? undefined : hp(84),
                    flexDirection: 'row',
                    gap: isChip ? wp(5) : hp(8),
                    paddingHorizontal: isChip ? wp(14) : wp(8),
                    paddingVertical: isChip ? hp(10) : hp(12),
                    borderWidth: isChip ? 1 : 1.5,
                    borderColor: isActive
                      ? COLORS.primary
                      : COLORS.chipBorder,
                    borderRadius: isChip ? RADIUS.full : RADIUS.xl,
                    backgroundColor: isActive
                      ? isChip
                        ? COLORS.primary
                        : COLORS.primary50
                      : COLORS.white,
                  }}
                  onPress={() => onSelect(category.key)}
                >
                  <Ionicons
                    name={category.icon}
                    size={isChip ? wp(14) : wp(20)}
                    color={
                      isActive
                        ? isChip
                          ? COLORS.white
                          : COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={{
                      fontSize: fp(isChip ? 14 : 12),
                      fontFamily: isChip ? FONTS.semiBold : FONTS.bold,
                      color: isActive
                        ? isChip
                          ? COLORS.white
                          : COLORS.primary
                        : COLORS.textPrimary,
                      textAlign: 'center',
                    }}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
