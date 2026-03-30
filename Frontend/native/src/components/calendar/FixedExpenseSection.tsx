import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { FixedExpenseItem } from '../../mock/calendar';
import FixedExpenseGroupBlock from './FixedExpenseGroupBlock';

interface FixedExpenseSectionProps {
  totalAmount: number;
  items: FixedExpenseItem[];
  detailItemsByCategory: Record<
    string,
    Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      isEnabled: boolean;
      category: string;
    }>
  >;
  onToggleExpand: (id: string) => void;
  onPressManage: () => void;
}

export default function FixedExpenseSection({
  totalAmount,
  items,
  detailItemsByCategory,
  onToggleExpand,
  onPressManage,
}: FixedExpenseSectionProps) {
  return (
    <SurfaceCard>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: wp(8) }}>
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            고정지출
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.86} onPress={onPressManage}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.semiBold,
              color: COLORS.primary,
            }}
          >
            관리
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          marginTop: hp(4),
          fontSize: fp(14),
          fontFamily: FONTS.bold,
          color: COLORS.primary,
        }}
      >
        {items.length > 0 ? `총 ${totalAmount.toLocaleString()}원` : '고정지출 내역이 없습니다'}
      </Text>

      <View style={{ gap: hp(12) }}>
        {items.length === 0 ? (
          <Text
            style={{
              fontSize: fp(12),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            고정지출 등록이 필요합니다.
          </Text>
        ) : (
          items.map((item) => {
            const detailItems = detailItemsByCategory[item.title] ?? [];

            return (
              <FixedExpenseGroupBlock
                key={item.id}
                item={item}
                detailItems={detailItems}
                onToggleExpand={onToggleExpand}
              />
            );
          })
        )}
      </View>
    </SurfaceCard>
  );
}
