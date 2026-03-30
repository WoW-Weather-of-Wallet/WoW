import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import type {
  CalendarEntryCategoryKey,
  CalendarEntryCategoryOption,
} from '../../constants/calendar/addEntry';
import {
  CALENDAR_ENTRY_CATEGORIES,
} from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface CalendarDirectCategorySheetProps {
  visible: boolean;
  selectedCategory: CalendarEntryCategoryKey | null;
  onClose: () => void;
  onSelectCategory: (category: CalendarEntryCategoryKey) => void;
}

function CategoryRow({
  category,
  isSelected,
  onPress,
}: {
  category: CalendarEntryCategoryOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      className="flex-row items-center justify-between"
      style={{
        minHeight: hp(58),
        borderRadius: RADIUS.lg,
        paddingHorizontal: wp(14),
        backgroundColor: isSelected ? COLORS.primary50 : COLORS.white,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center" style={{ gap: wp(12) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(36),
            height: wp(36),
            borderRadius: wp(18),
            backgroundColor: isSelected ? COLORS.primary : COLORS.backgroundSecondary,
          }}
        >
          <Ionicons
            name={category.icon}
            size={wp(18)}
            color={isSelected ? COLORS.white : COLORS.textSecondary}
          />
        </View>
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.semiBold,
            color: COLORS.textPrimary,
          }}
        >
          {category.label}
        </Text>
      </View>

      {isSelected ? (
        <Ionicons name="checkmark" size={wp(22)} color={COLORS.primary} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function CalendarDirectCategorySheet({
  visible,
  selectedCategory,
  onClose,
  onSelectCategory,
}: CalendarDirectCategorySheetProps) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="카테고리 선택"
      subtitle="변경할 카테고리를 선택해주세요."
      scrollable={false}
    >
      <ScrollView
        style={{ maxHeight: hp(430) }}
        contentContainerStyle={{ gap: hp(8), paddingBottom: hp(8) }}
        bounces={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {CALENDAR_ENTRY_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.key}
            category={category}
            isSelected={selectedCategory === category.key}
            onPress={() => onSelectCategory(category.key)}
          />
        ))}
      </ScrollView>
    </BottomSheetModal>
  );
}
