import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp } from '../../constants/theme';
import type { CalendarUploadPreviewGroup } from '../../types/calendar';
import CalendarUploadResultItemRow from './CalendarUploadResultItemRow';

interface CalendarUploadResultSectionProps {
  group: CalendarUploadPreviewGroup;
  onPressItem: (itemId: string) => void;
}

export default function CalendarUploadResultSection({
  group,
  onPressItem,
}: CalendarUploadResultSectionProps) {
  const needsCategoryCount = useMemo(
    () => group.items.filter((item) => item.status === 'needs-category').length,
    [group.items],
  );

  return (
    <View style={{ gap: hp(10) }}>
      <View className="flex-row items-center justify-between">
        <Text
          style={{
            fontSize: fp(18),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {group.dateKey}
        </Text>
        <Text
          style={{
            fontSize: fp(13),
            fontFamily: FONTS.semiBold,
            color: COLORS.textSecondary,
          }}
        >
          {group.totalCount}건
          <Text style={{ color: COLORS.warningOrange }}>
            {' '}
            미분류 항목 {needsCategoryCount}건
          </Text>
        </Text>
      </View>

      <View
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.transactionBackground,
          overflow: 'hidden',
        }}
      >
        {group.items.map((item, index) => (
          <CalendarUploadResultItemRow
            key={item.id}
            item={item}
            isLast={index === group.items.length - 1}
            onPress={onPressItem}
          />
        ))}
      </View>
    </View>
  );
}
