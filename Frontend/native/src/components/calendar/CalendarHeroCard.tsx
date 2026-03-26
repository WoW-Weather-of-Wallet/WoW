import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';
import type { CalendarOverview } from '../../mock/calendar';
import type { CalendarHeaderFetchState } from '../../types/calendar';
import CalendarHeroHeader from './CalendarHeroHeader';
import CalendarHeroSummaryRow from './CalendarHeroSummaryRow';
import CalendarHeroWeatherCard from './CalendarHeroWeatherCard';

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
      <CalendarHeroHeader
        title="캘린더"
        addLabel="+ 내역 추가"
        onPressAdd={onPressAdd}
        onPressInfo={onPressInfo}
      />

      <View style={styles.monthRow}>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressPrevMonth}>
          <Ionicons name="chevron-back" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressNextMonth}>
          <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <CalendarHeroWeatherCard
        weatherIconName={weatherIconName}
        title={weatherTitle}
        hint={weatherHint}
      />

      <CalendarHeroSummaryRow
        label="이번 달 절약 가능 금액"
        amountText={savingsAmountText}
        goalLabel={goalLabel}
      />

      <Text style={styles.statusText}>
        {buildStatusMessage(headerFetchState, headerErrorMessage)}
      </Text>
    </LinearGradient>
  );
}

function buildStatusMessage(state: CalendarHeaderFetchState, errorMessage: string | null) {
  if (state === 'loading') {
    return '캘린더 요약 정보를 불러오는 중입니다.';
  }

  if (state === 'live') {
    return '최신 데이터를 기준으로 요약했습니다.';
  }

  if (state === 'fallback') {
    return errorMessage ?? '-';
  }

  return '-';
}
