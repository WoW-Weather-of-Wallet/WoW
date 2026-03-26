import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { CalendarUploadPreviewItem } from '../../types/calendar';
import { styles } from './calendarAddEntryUi';

interface CalendarUploadResultItemRowProps {
  item: CalendarUploadPreviewItem;
  isLast: boolean;
  onPress: (id: string) => void;
}

export default function CalendarUploadResultItemRow({
  item,
  isLast,
  onPress,
}: CalendarUploadResultItemRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.uploadResultItem, !isLast && styles.uploadResultDivider]}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.uploadResultLeft}>
        <View style={styles.uploadResultIcon}>
          <Ionicons name="document-text-outline" size={wp(16)} color={COLORS.textTertiary} />
        </View>
        <View style={styles.uploadResultTextWrap}>
          <Text style={styles.uploadResultMerchant}>{item.merchantName}</Text>
          {item.description ? (
            <Text style={styles.uploadResultDescription}>{item.description}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.uploadResultRight}>
        <Text style={styles.uploadResultAmount}>-{item.amount.toLocaleString()}원</Text>
        <View
          style={[
            styles.uploadResultBadge,
            item.status === 'needs-category'
              ? styles.uploadResultBadgeWarning
              : styles.uploadResultBadgeDefault,
          ]}
        >
          <Text
            style={[
              styles.uploadResultBadgeText,
              item.status === 'needs-category'
                ? styles.uploadResultBadgeTextWarning
                : styles.uploadResultBadgeTextDefault,
            ]}
          >
            {item.categoryLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
