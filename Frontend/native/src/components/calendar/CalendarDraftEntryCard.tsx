import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { ManualCalendarEntryDraft } from '../../types/calendar';
import { formatDateLabel as formatCalendarDateLabel } from '../../utils/calendarAddEntry';
import { styles } from './CalendarAddEntrySheet.styles';

interface CalendarDraftEntryCardProps {
  draft: ManualCalendarEntryDraft;
  onRemove: (id: string) => void;
}

export default function CalendarDraftEntryCard({
  draft,
  onRemove,
}: CalendarDraftEntryCardProps) {
  return (
    <View style={styles.draftCard}>
      <View style={styles.draftHeaderRow}>
        <Text style={styles.draftDateText}>{formatCalendarDateLabel(draft.dateKey)}</Text>
        <Text style={styles.draftAmountText}>-{draft.amount.toLocaleString()}원</Text>
      </View>

      <View style={styles.draftBodyRow}>
        <View style={styles.draftMetaWrap}>
          <Text style={styles.draftMerchantText}>{draft.merchantName}</Text>
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>{draft.category}</Text>
          </View>
          <View style={styles.paymentBadge}>
            <Ionicons
              name={draft.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'}
              size={wp(12)}
              color={COLORS.primary}
            />
            <Text style={styles.paymentBadgeText}>
              {draft.paymentMethod === 'cash' ? '현금' : '카드'}
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => onRemove(draft.id)}>
          <Ionicons name="close" size={wp(16)} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
