import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
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
    headerFetchState === 'live'
      ? `${overview.savingsAmount.toLocaleString()}\uC6D0`
      : '-';
  const goalLabel = headerFetchState === 'live' ? overview.goalLabel : '-';

  return (
    <LinearGradient
      colors={[COLORS.calendarHeroStart, COLORS.calendarHeroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: RADIUS.xxl,
        paddingHorizontal: wp(16),
        paddingTop: hp(16),
        paddingBottom: hp(18),
        overflow: 'hidden',
      }}
    >
      <CalendarHeroHeader
        title={'\uCEA8\uB9B0\uB354'}
        addLabel={'+ \uB0B4\uC5ED \uCD94\uAC00'}
        onPressAdd={onPressAdd}
        onPressInfo={onPressInfo}
      />

      <View
        className="flex-row items-center"
        style={{ gap: wp(12), marginBottom: hp(16) }}
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
        <Text
          style={{
            fontSize: fp(18),
            fontFamily: FONTS.bold,
            color: COLORS.white,
          }}
        >
          {monthLabel}
        </Text>
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
        weatherIconName={weatherIconName}
        title={weatherTitle}
        hint={weatherHint}
      />

      <CalendarHeroSummaryRow
        label={'\uC774\uBC88 \uB2EC \uC808\uC57D \uAC00\uB2A5 \uAE08\uC561'}
        amountText={savingsAmountText}
        goalLabel={goalLabel}
      />

      <Text
        style={{
          marginTop: hp(12),
          fontSize: fp(11),
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
