import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarDayDetailSheet.styles';
import type { CalendarDayDetail } from '../../mock/calendar';

interface CalendarDayDetailSheetProps {
  detail: CalendarDayDetail | null;
  visible: boolean;
  memoValue: string;
  onChangeMemo: (value: string) => void;
  onSaveMemo: () => void;
  onClose: () => void;
}

function getWeatherIconName(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return 'moon-outline' as const;
  }

  return detail.weatherLabel === '맑음' ? 'sunny-outline' : 'partly-sunny-outline';
}

/**
 * 날짜별 상세 시트는 미래 날짜와 실제 소비가 있는 날짜를 같은 구조 안에서 보여줍니다.
 */
export default function CalendarDayDetailSheet({
  detail,
  visible,
  memoValue,
  onChangeMemo,
  onSaveMemo,
  onClose,
}: CalendarDayDetailSheetProps) {
  if (!detail) {
    return null;
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      showHandle={false}
      title={detail.title}
      subtitle="선택한 날짜의 소비 기록과 메모를 확인할 수 있어요."
    >
      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <Ionicons name={getWeatherIconName(detail)} size={wp(28)} color={COLORS.primary} />
          <View>
            <Text style={styles.weatherLabel}>{detail.weatherLabel}</Text>
            <Text style={styles.weatherHint}>{detail.weatherHint}</Text>
          </View>
        </View>
        <Text style={styles.temperature}>{detail.weatherTemperature}</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>지출</Text>
          <Text style={[styles.metricValue, styles.metricSpent]}>
            {detail.spentAmount === null ? '-' : `-₩${detail.spentAmount.toLocaleString()}`}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>건수</Text>
          <Text style={[styles.metricValue, styles.metricCount]}>
            {detail.transactionCount === null ? '-' : `${detail.transactionCount}건`}
          </Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>조회된 거래 내역</Text>
          <View style={styles.readonlyBadge}>
            <Text style={styles.readonlyBadgeText}>읽기 전용</Text>
          </View>
        </View>
        {detail.items.length > 0 ? (
          detail.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={wp(18)}
                    color={COLORS.textPrimary}
                  />
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.itemAmount}>-₩{item.amount.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 거래 내역이 없어요.</Text>
          </View>
        )}
      </View>

      <View style={styles.memoSection}>
        <Text style={styles.memoTitle}>오늘의 메모</Text>
        <Text style={styles.memoHint}>선택한 날짜의 소비 기록이나 느낌을 간단히 남길 수 있어요.</Text>
        <TextInput
          value={memoValue}
          onChangeText={onChangeMemo}
          placeholder="이 날의 소비 기록이나 느낌을 남겨보세요..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.memoInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.saveButton} onPress={onSaveMemo}>
        <Text style={styles.saveButtonText}>메모 저장</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
