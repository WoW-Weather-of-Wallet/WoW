import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarDayDetail } from '../../mock/calendar';

interface CalendarDayDetailOverviewCardProps {
  detail: CalendarDayDetail;
}

function getWeatherIconName(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return 'moon-outline' as const;
  }

  return detail.weatherLabel === '\uB9D1\uC74C'
    ? ('sunny-outline' as const)
    : ('partly-sunny-outline' as const);
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
  return (
    <>
      <View
        className="flex-row items-center justify-between"
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.calendarDayDetailBackground,
          paddingHorizontal: wp(16),
          paddingVertical: hp(16),
          marginBottom: hp(14),
        }}
      >
        <View className="flex-row items-center" style={{ gap: wp(12) }}>
          <Ionicons
            name={getWeatherIconName(detail)}
            size={wp(28)}
            color={COLORS.primary}
          />
          <View>
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
        <Text
          style={{
            fontSize: fp(26),
            fontFamily: FONTS.bold,
            color: COLORS.textSecondary,
          }}
        >
          {detail.weatherTemperature}
        </Text>
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
