import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { ManualCalendarEntryDraft } from '../../types/calendar';
import { formatDateLabel as formatCalendarDateLabel } from '../../utils/calendarAddEntry';

interface CalendarDraftEntryCardProps {
  draft: ManualCalendarEntryDraft;
  onRemove: (id: string) => void;
}

export default function CalendarDraftEntryCard({
  draft,
  onRemove,
}: CalendarDraftEntryCardProps) {
  return (
    <View
      style={{
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.draftCardBackground,
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
      }}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: hp(10) }}>
        <Text
          style={{
            fontSize: fp(15),
            fontFamily: FONTS.bold,
            color: COLORS.primary,
          }}
        >
          {formatCalendarDateLabel(draft.dateKey)}
        </Text>
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.bold,
            color: COLORS.spentRed,
          }}
        >
          -{draft.amount.toLocaleString()}원
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center" style={{ gap: wp(10) }}>
          <Text
            style={{
              fontSize: fp(17),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {draft.merchantName}
          </Text>
          <View
            style={{
              backgroundColor: COLORS.draftBadgeBackground,
              borderRadius: RADIUS.full,
              paddingHorizontal: wp(8),
              paddingVertical: hp(4),
            }}
          >
            <Text
              style={{
                fontSize: fp(11),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
              }}
            >
              {draft.category}
            </Text>
          </View>
          <View
            className="flex-row items-center"
            style={{
              gap: wp(4),
              backgroundColor: COLORS.primary50,
              borderRadius: RADIUS.full,
              paddingHorizontal: wp(8),
              paddingVertical: hp(4),
            }}
          >
            <Ionicons
              name={draft.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'}
              size={wp(12)}
              color={COLORS.primary}
            />
            <Text
              style={{
                fontSize: fp(11),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
              }}
            >
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
