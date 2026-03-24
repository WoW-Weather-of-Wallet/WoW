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
  // 이전 시도:
  // - 월 이동을 별도 상단 바로 분리했지만, 기존 화면 흐름과 시각 톤이 너무 달라졌습니다.
  //
  // 변경 이유:
  // - 사용자가 익숙한 기존 구조를 유지하면서도, 보라색 히어로 카드 자체만 상단에 고정되게
  //   만들기 위해 월 이동 UI를 다시 카드 내부로 되돌립니다.
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
          <Text style={styles.weatherTitle}>{overview.weatherTitle}</Text>
          <Text style={styles.weatherHint}>{overview.weatherHint}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>지난달 대비 절약 금액</Text>
          <Text style={styles.summaryAmount}>{overview.savingsAmount.toLocaleString()}원</Text>
        </View>

        <View style={styles.goalBadge}>
          <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
          <Text style={styles.goalBadgeText}>{overview.goalLabel}</Text>
        </View>
      </View>

      <Text style={styles.statusText}>
        {buildStatusMessage(headerFetchState, headerErrorMessage)}
      </Text>
    </LinearGradient>
  );
}

function buildStatusMessage(state: CalendarHeaderFetchState, errorMessage: string | null) {
  // The calendar body is still mock-driven, so we surface whether the header is live or fallback.
  if (state === 'loading') {
    return '헤더 데이터를 불러오는 중입니다.';
  }

  if (state === 'live') {
    return '백엔드 캘린더 헤더와 연결되었습니다.';
  }

  if (state === 'fallback') {
    return errorMessage ?? '현재 월이 아니거나 로그인되지 않아 기본 헤더를 표시 중입니다.';
  }

  return '캘린더 헤더 준비 중입니다.';
}
