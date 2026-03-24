import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { FixedExpenseItem } from '../../mock/calendar';

interface FixedExpenseSectionProps {
  totalAmount: number;
  items: FixedExpenseItem[];
  onPressManage: () => void;
}

const statusStyles = {
  done: { backgroundColor: '#EFF9EE', color: '#7CB66C' },
  countdown: { backgroundColor: '#FFF7E7', color: '#D2A446' },
  pending: { backgroundColor: '#F4F5FB', color: COLORS.textSecondary },
} as const;

/**
 * 캘린더 하단 고정지출 요약 영역입니다. 관리 화면으로 이어지는 진입점 역할도 함께 맡습니다.
 */
export default function FixedExpenseSection({
  totalAmount,
  items,
  onPressManage,
}: FixedExpenseSectionProps) {
  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.pinEmoji}>📌</Text>
          <Text style={styles.headerTitle}>고정지출</Text>
          <Text style={styles.filterLabel}>전체</Text>
        </View>
        <TouchableOpacity activeOpacity={0.86} onPress={onPressManage}>
          <Text style={styles.manageText}>관리</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalLabel}>전체 ₩{totalAmount.toLocaleString()}</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.rowCard}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={wp(20)}
                  color={COLORS.textPrimary}
                />
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              {item.statusLabel ? (
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusStyles[item.statusTone].backgroundColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusStyles[item.statusTone].color }]}>
                    {item.statusLabel}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.amount}>
                {item.amount > 0 ? `₩${item.amount.toLocaleString()}` : '₩0'}
              </Text>
              <Ionicons
                name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
                size={wp(16)}
                color={COLORS.textTertiary}
              />
            </View>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  pinEmoji: {
    fontSize: fp(16),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  filterLabel: {
    marginLeft: wp(4),
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  manageText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  totalLabel: {
    marginTop: hp(4),
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  list: {
    gap: hp(12),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: '#F8F7FF',
    paddingHorizontal: wp(14),
    paddingVertical: hp(14),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp(12),
  },
  iconWrap: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: hp(6),
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
  },
  statusText: {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
  },
  amount: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
});
