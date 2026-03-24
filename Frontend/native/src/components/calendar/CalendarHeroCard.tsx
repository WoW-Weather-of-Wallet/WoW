import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';
import type { CalendarOverview } from '../../mock/calendar';
import type { CalendarHeaderFetchState } from '../../types/calendar';

interface CalendarHeroCardProps {
  overview: CalendarOverview;
  monthLabel: string;
  weatherIconName: keyof typeof Ionicons.glyphMap;
  headerFetchState: CalendarHeaderFetchState;
  headerErrorMessage: string | null;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressAdd?: () => void;
  onPressInfo?: () => void;
}

export default function CalendarHeroCard({
  overview,
  monthLabel,
  weatherIconName,
  headerFetchState,
  headerErrorMessage,
  onPressPrevMonth,
  onPressNextMonth,
  onPressAdd,
  onPressInfo,
}: CalendarHeroCardProps) {
  const weatherTitle = headerFetchState === 'live' ? overview.weatherTitle : '-';
  const weatherHint = headerFetchState === 'live' ? overview.weatherHint : '-';
  const savingsAmountText =
    headerFetchState === 'live' ? `${overview.savingsAmount.toLocaleString()}원` : '-';
  const goalLabel = headerFetchState === 'live' ? overview.goalLabel : '-';

  return (
    <LinearGradient
      colors={[COLORS.calendarHeroStart, COLORS.calendarHeroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.screenTitle}>캘린더</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.infoButton} onPress={onPressInfo}>
            <Ionicons name="information-circle-outline" size={wp(18)} color={COLORS.white} />
          </TouchableOpacity>
        </View>
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
          <Ionicons name={weatherIconName} size={wp(25)} color={COLORS.weatherSun} />
        </View>
        <View style={styles.weatherTextBlock}>
          <Text style={styles.weatherTitle}>{weatherTitle}</Text>
          <Text style={styles.weatherHint}>{weatherHint}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>이번 달 절약 금액</Text>
          <Text style={styles.summaryAmount}>{savingsAmountText}</Text>
        </View>

        <View style={styles.goalBadge}>
          <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
          <Text style={styles.goalBadgeText}>{goalLabel}</Text>
        </View>
      </View>

      <Text style={styles.statusText}>
        {buildStatusMessage(headerFetchState, headerErrorMessage)}
      </Text>
    </LinearGradient>
  );
}

function buildStatusMessage(state: CalendarHeaderFetchState, errorMessage: string | null) {
  if (state === 'loading') {
    return '캘린더 정보를 불러오는 중입니다.';
  }

  if (state === 'live') {
    return '최신 정보를 불러왔습니다.';
  }

  if (state === 'fallback') {
    return errorMessage ?? '-';
  }

  return '-';
}
