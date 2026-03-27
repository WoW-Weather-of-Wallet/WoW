import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarDayDetail } from '../../mock/calendar';
import { buildHomeWeatherVisual } from '../../utils/homeWeatherPresentation';

interface CalendarDayDetailOverviewCardProps {
  detail: CalendarDayDetail;
}

function getSpentAmountLabel(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return '-';
  }

  return `-${detail.spentAmount.toLocaleString()}\uC6D0`;
}

function getTransactionCountLabel(detail: CalendarDayDetail) {
  if (detail.transactionCount === null) {
    return '-';
  }

  return `${detail.transactionCount}\uAC74`;
}

export default function CalendarDayDetailOverviewCard({
  detail,
}: CalendarDayDetailOverviewCardProps) {
  const weatherVisual = useMemo(
    () =>
      buildHomeWeatherVisual({
        weatherName: detail.weatherLabel,
        description: detail.weatherHint,
        iconCode: detail.weatherIconCode,
      }),
    [detail.weatherHint, detail.weatherIconCode, detail.weatherLabel],
  );
  const WeatherIcon = weatherVisual.icon;

  return (
    <>
      <View
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.calendarDayDetailBackground,
          paddingHorizontal: wp(16),
          paddingVertical: hp(16),
          marginBottom: hp(14),
        }}
      >
        <View className="flex-row items-center" style={{ gap: wp(12) }}>
          <WeatherIcon size={wp(28)} color={weatherVisual.color} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: fp(18),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
                marginBottom: hp(4),
              }}
            >
              {detail.weatherLabel}
            </Text>
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {detail.weatherHint}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row" style={{ gap: wp(12), marginBottom: hp(18) }}>
        <MetricCard
          title={'\uC9C0\uCD9C\uC561'}
          value={getSpentAmountLabel(detail)}
          valueColor={COLORS.spentRed}
        />
        <MetricCard
          title={'\uAC70\uB798 \uAC74\uC218'}
          value={getTransactionCountLabel(detail)}
          valueColor={COLORS.primary}
        />
      </View>
    </>
  );
}

function MetricCard({
  title,
  value,
  valueColor,
}: {
  title: string;
  value: string;
  valueColor: string;
}) {
  return (
    <View
      className="flex-1"
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.backgroundSecondary,
        padding: wp(16),
      }}
    >
      <Text
        style={{
          fontSize: fp(13),
          fontFamily: FONTS.semiBold,
          color: COLORS.textTertiary,
          marginBottom: hp(6),
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: fp(22),
          fontFamily: FONTS.bold,
          color: valueColor,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
