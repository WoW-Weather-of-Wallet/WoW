import React from 'react';
import { Text, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import type { CalendarDayDetail } from '../../mock/calendar';
import { styles } from './CalendarDayDetailSheet.styles';
import CalendarDayDetailMemoSection from './CalendarDayDetailMemoSection';
import CalendarDayDetailOverviewCard from './CalendarDayDetailOverviewCard';
import CalendarDayDetailTransactionRow from './CalendarDayDetailTransactionRow';

interface CalendarDayDetailSheetProps {
  detail: CalendarDayDetail | null;
  visible: boolean;
  memoValue: string;
  onChangeMemo: (value: string) => void;
  onSaveMemo: () => void;
  onClose: () => void;
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
      subtitle="선택한 날짜의 소비 요약과 거래 내역을 확인할 수 있습니다."
    >
      <CalendarDayDetailOverviewCard detail={detail} />

      <View style={styles.listSection}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>거래 내역</Text>
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
            <Text style={styles.emptyText}>등록된 거래 내역이 없습니다.</Text>
          </View>
        )}
      </View>

      <CalendarDayDetailMemoSection
        memoValue={memoValue}
        onChangeMemo={onChangeMemo}
        onSaveMemo={onSaveMemo}
      />
    </BottomSheetModal>
  );
}
