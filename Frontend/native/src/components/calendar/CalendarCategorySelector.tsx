import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CALENDAR_ENTRY_CATEGORY_GROUPS,
  type CalendarEntryCategoryKey,
} from '../../constants/calendar/addEntry';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarCategorySelector.styles';

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
    <View style={styles.sectionList}>
      {CALENDAR_ENTRY_CATEGORY_GROUPS.map((group) => (
        <View key={group.key} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.label}</Text>
          <View style={variant === 'chip' ? styles.chipGrid : styles.cardGrid}>
            {group.items.map((category) => {
              const isActive = selectedCategory === category.key;

              return (
                <TouchableOpacity
                  key={category.key}
                  activeOpacity={0.88}
                  style={[
                    variant === 'chip' ? styles.chip : styles.card,
                    isActive && (variant === 'chip' ? styles.chipActive : styles.cardActive),
                  ]}
                  onPress={() => onSelect(category.key)}
                >
                  <Ionicons
                    name={category.icon}
                    size={variant === 'chip' ? wp(14) : wp(20)}
                    color={
                      isActive
                        ? variant === 'chip'
                          ? COLORS.white
                          : COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      variant === 'chip' ? styles.chipText : styles.cardText,
                      isActive && (variant === 'chip' ? styles.chipTextActive : styles.cardTextActive),
                    ]}
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
