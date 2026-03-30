import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, TYPOGRAPHY, hp, wp } from '../../constants/theme';
import type { CalendarOverview } from '../../mock/calendar';
import type { CalendarHeaderFetchState } from '../../types/calendar';
import CalendarHeroHeader from './CalendarHeroHeader';
import CalendarHeroSummaryRow from './CalendarHeroSummaryRow';
import CalendarHeroWeatherCard from './CalendarHeroWeatherCard';

interface CalendarHeroCardProps {
  overview: CalendarOverview;
  monthLabel: string;
  weatherIconCode?: string | null;
  headerFetchState: CalendarHeaderFetchState;
  headerErrorMessage: string | null;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressMonthLabel?: () => void;
  onPressAdd?: () => void;
  onPressInfo?: () => void;
}

export default function CalendarHeroCard({
  overview,
  monthLabel,
  weatherIconCode,
  headerFetchState,
  headerErrorMessage,
  onPressPrevMonth,
  onPressNextMonth,
  onPressMonthLabel,
  onPressAdd,
  onPressInfo,
}: CalendarHeroCardProps) {
  const weatherTitle = headerFetchState === 'live' ? overview.weatherTitle : '-';
  const weatherHint = headerFetchState === 'live' ? overview.weatherHint : '-';
  const goalLabel = headerFetchState === 'live' ? overview.goalLabel : '-';

  return (
    <LinearGradient
      colors={[COLORS.calendarHeroStart, COLORS.calendarHeroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: RADIUS.xxl,
        paddingHorizontal: wp(14),
        paddingTop: hp(14),
        paddingBottom: hp(14),
        overflow: 'hidden',
      }}
    >
      <CalendarHeroHeader
        title={'\uCE98\uB9B0\uB354'}
        addLabel={'+ \uB0B4\uC5ED \uCD94\uAC00'}
        onPressAdd={onPressAdd}
        onPressInfo={onPressInfo}
      />

      <View
        className="flex-row items-center"
        style={{ gap: wp(10), marginBottom: hp(10) }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className="items-center justify-center"
          style={{
            width: wp(30),
            height: wp(30),
            borderRadius: wp(15),
            backgroundColor: COLORS.whiteOverlay22,
          }}
          onPress={onPressPrevMonth}
        >
          <Ionicons name="chevron-back" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={onPressMonthLabel}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.title.fontSize,
              lineHeight: TYPOGRAPHY.title.lineHeight,
              fontFamily: FONTS.bold,
              color: COLORS.white,
            }}
          >
            {monthLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          className="items-center justify-center"
          style={{
            width: wp(30),
            height: wp(30),
            borderRadius: wp(15),
            backgroundColor: COLORS.whiteOverlay22,
          }}
          onPress={onPressNextMonth}
        >
          <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <CalendarHeroWeatherCard
        weatherName={weatherTitle}
        description={weatherHint}
        iconCode={weatherIconCode}
        isLoading={headerFetchState === 'loading'}
      />

      <CalendarHeroSummaryRow
        goalLabel={goalLabel}
      />

      <Text
        style={{
          marginTop: hp(8),
          fontSize: TYPOGRAPHY.caption.fontSize,
          lineHeight: TYPOGRAPHY.caption.lineHeight,
          fontFamily: FONTS.medium,
          color: COLORS.calendarHeroSubText,
        }}
      >
        {buildStatusMessage(headerFetchState, headerErrorMessage)}
      </Text>
    </LinearGradient>
  );
}

function buildStatusMessage(
  state: CalendarHeaderFetchState,
  errorMessage: string | null,
) {
  if (state === 'loading') {
    return '\uCEA8\uB9B0\uB354 \uC694\uC57D \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.';
  }

  if (state === 'live') {
    return '\uCD5C\uC2E0 \uB370\uC774\uD130\uB97C \uAE30\uC900\uC73C\uB85C \uC694\uC57D\uD588\uC5B4\uC694.';
  }

  if (state === 'fallback') {
    return errorMessage ?? '-';
  }

  return '-';
}
