import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import type { CalendarEntryCategoryKey } from '../../constants/calendar/addEntry';
import { COLORS, wp } from '../../constants/theme';
import type { CalendarUploadPreviewItem } from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';
import CalendarCategorySelector from './CalendarCategorySelector';

interface CalendarUploadCategorySheetProps {
  selectedItem: CalendarUploadPreviewItem | null;
  onClose: () => void;
  onSelectCategory: (categoryLabel: CalendarEntryCategoryKey) => void;
}

export default function CalendarUploadCategorySheet({
  selectedItem,
  onClose,
  onSelectCategory,
}: CalendarUploadCategorySheetProps) {
  return (
    <BottomSheetModal
      visible={selectedItem !== null}
      onClose={onClose}
      title="카테고리 선택"
      subtitle={
        selectedItem ? `${selectedItem.merchantName} · ${selectedItem.amount.toLocaleString()}원` : ''
      }
      scrollable={false}
    >
      <View style={styles.categorySelectWrap}>
        <View style={styles.recommendBadge}>
          <Ionicons name="sparkles-outline" size={wp(12)} color={COLORS.warningOrange} />
          <Text style={styles.recommendBadgeText}>
            자동 분류가 애매한 항목은 직접 고를 수 있어요.
          </Text>
        </View>

        <ScrollView
          style={styles.categorySelectScroll}
          contentContainerStyle={styles.categorySelectContent}
          bounces={false}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <CalendarCategorySelector variant="chip" onSelect={onSelectCategory} />
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
}
