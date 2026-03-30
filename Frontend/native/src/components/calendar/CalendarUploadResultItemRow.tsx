import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarUploadPreviewItem } from '../../types/calendar';

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
  const needsCategory = item.status === 'needs-category';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: wp(14),
        paddingVertical: hp(13),
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.resultDivider,
      }}
      onPress={() => onPress(item.id)}
    >
      <View className="flex-1 flex-row items-center" style={{ gap: wp(10) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(32),
            height: wp(32),
            borderRadius: wp(16),
            backgroundColor: COLORS.resultIconBackground,
          }}
        >
          <Ionicons name="document-text-outline" size={wp(16)} color={COLORS.textTertiary} />
        </View>
        <View className="flex-1" style={{ gap: hp(4) }}>
          <Text
            style={{
              fontSize: fp(15),
              fontFamily: FONTS.semiBold,
              color: COLORS.textPrimary,
            }}
          >
            {item.merchantName}
          </Text>
          {item.description ? (
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="items-end" style={{ gap: hp(6) }}>
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.bold,
            color: COLORS.spentRed,
          }}
        >
          -{item.amount.toLocaleString()}원
        </Text>
        <View
          style={{
            borderRadius: RADIUS.full,
            paddingHorizontal: wp(8),
            paddingVertical: hp(4),
            backgroundColor: needsCategory
              ? COLORS.needsCategoryBackground
              : COLORS.classifiedBadgeBackground,
          }}
        >
          <Text
            style={{
              fontSize: fp(11),
              fontFamily: FONTS.bold,
              color: needsCategory ? COLORS.warningOrange : COLORS.classifiedBadgeText,
            }}
          >
            {item.categoryLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
