import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { CalendarUploadPreviewGroup } from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';
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
    <View style={styles.uploadResultSection}>
      <View style={styles.uploadResultHeader}>
        <Text style={styles.uploadResultDate}>{group.dateKey}</Text>
        <Text style={styles.uploadResultSummary}>
          {group.totalCount}건
          <Text style={styles.uploadResultNeedsCategory}>
            {' '}
            미분류 항목 {needsCategoryCount}건
          </Text>
        </Text>
      </View>

      <View style={styles.uploadResultList}>
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
