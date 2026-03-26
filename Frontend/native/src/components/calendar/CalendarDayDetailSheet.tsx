import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarDayDetailSheet.styles';
import type { CalendarDayDetail } from '../../mock/calendar';
import CalendarDayDetailTransactionRow from './CalendarDayDetailTransactionRow';

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

function getSpentAmountLabel(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return '-';
  }

  return `-₩${detail.spentAmount.toLocaleString()}`;
}

function getTransactionCountLabel(detail: CalendarDayDetail) {
  if (detail.transactionCount === null) {
    return '-';
  }

  return `${detail.transactionCount}건`;
}

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
      subtitle="선택한 날짜의 소비 기록과 메모를 확인할 수 있어요"
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
            {getSpentAmountLabel(detail)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>건수</Text>
          <Text style={[styles.metricValue, styles.metricCount]}>
            {getTransactionCountLabel(detail)}
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
            <CalendarDayDetailTransactionRow key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 거래 내역이 없어요</Text>
          </View>
        )}
      </View>

      <View style={styles.memoSection}>
        <Text style={styles.memoTitle}>오늘의 메모</Text>
        <Text style={styles.memoHint}>
          선택한 날짜의 소비 기록이나 생각을 간단하게 적어둘 수 있어요
        </Text>
        <TextInput
          value={memoValue}
          onChangeText={onChangeMemo}
          placeholder="그날의 소비 기록이나 생각을 적어보세요..."
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
