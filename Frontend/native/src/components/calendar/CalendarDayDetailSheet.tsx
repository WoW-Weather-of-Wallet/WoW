import React from 'react';
import { Text, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import type { CalendarDayDetail } from '../../mock/calendar';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
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
      subtitle={
        '\uD574\uB2F9 \uB0A0\uC9DC\uC758 \uC9C0\uCD9C \uC694\uC57D\uACFC \uAC70\uB798 \uB0B4\uC5ED\uC744 \uD568\uAED8 \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.'
      }
    >
      <CalendarDayDetailOverviewCard detail={detail} />

      <View style={{ marginBottom: hp(18) }}>
        <View
          className="flex-row items-center justify-between"
          style={{ marginBottom: hp(10), gap: wp(10) }}
        >
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {'\uAC70\uB798 \uB0B4\uC5ED'}
          </Text>
          <View
            style={{
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.backgroundTertiary,
              paddingHorizontal: wp(10),
              paddingVertical: hp(4),
            }}
          >
            <Text
              style={{
                fontSize: fp(11),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary,
              }}
            >
              {'\uC0C1\uC138 \uC870\uD68C'}
            </Text>
          </View>
        </View>
        {detail.items.length > 0 ? (
          detail.items.map((item) => (
            <CalendarDayDetailTransactionRow key={item.id} item={item} />
          ))
        ) : (
          <View
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.backgroundSecondary,
              paddingHorizontal: wp(16),
              paddingVertical: hp(16),
            }}
          >
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {'\uAE30\uB85D\uB41C \uAC70\uB798 \uB0B4\uC5ED\uC774 \uC5C6\uC5B4\uC694.'}
            </Text>
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
