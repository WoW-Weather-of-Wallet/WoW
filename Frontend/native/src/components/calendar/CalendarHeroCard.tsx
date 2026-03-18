import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';
import type { CalendarOverview } from '../../mock/calendar';

interface CalendarHeroCardProps {
  overview: CalendarOverview;
  monthLabel: string;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressAdd?: () => void;
}

export default function CalendarHeroCard({
  overview,
  monthLabel,
  onPressPrevMonth,
  onPressNextMonth,
  onPressAdd,
}: CalendarHeroCardProps) {
  return (
    <LinearGradient
      colors={[COLORS.calendarHeroStart, COLORS.calendarHeroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{overview.title}</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.addButton} onPress={onPressAdd}>
          <Text style={styles.addButtonText}>+ 내역 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthRow}>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressPrevMonth}>
          <Ionicons name="chevron-back" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressNextMonth}>
          <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherIconWrap}>
          <Ionicons name="partly-sunny" size={wp(25)} color={COLORS.weatherSun} />
        </View>
        <View style={styles.weatherTextBlock}>
          <Text style={styles.weatherTitle}>{overview.weatherTitle}</Text>
          <Text style={styles.weatherHint}>{overview.weatherHint}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>이번 달 절약 금액</Text>
          <Text style={styles.summaryAmount}>₩{overview.savingsAmount.toLocaleString()}원</Text>
        </View>

        <View style={styles.goalBadge}>
          <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
          <Text style={styles.goalBadgeText}>{overview.goalLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

