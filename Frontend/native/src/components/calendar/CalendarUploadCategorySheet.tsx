import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import type { CalendarEntryCategoryKey } from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarUploadPreviewItem } from '../../types/calendar';
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
        selectedItem ? `${selectedItem.merchantName} / ${selectedItem.amount.toLocaleString()}원` : ''
      }
      scrollable={false}
    >
      <View style={{ paddingBottom: hp(4) }}>
        <View
          className="self-start flex-row items-center"
          style={{
            gap: wp(4),
            backgroundColor: COLORS.needsCategoryBackground,
            borderRadius: RADIUS.full,
            paddingHorizontal: wp(10),
            paddingVertical: hp(6),
            marginBottom: hp(14),
          }}
        >
          <Ionicons name="sparkles-outline" size={wp(12)} color={COLORS.warningOrange} />
          <Text
            style={{
              fontSize: fp(12),
              fontFamily: FONTS.semiBold,
              color: COLORS.warningOrange,
            }}
          >
            자동 분류가 애매한 항목은 직접 선택해 주세요.
          </Text>
        </View>

        <ScrollView
          style={{ maxHeight: hp(320) }}
          contentContainerStyle={{ paddingBottom: hp(8) }}
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
