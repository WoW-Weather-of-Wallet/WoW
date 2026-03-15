import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarTransactionGroup } from '../../mock/calendar';

interface TransactionHistorySectionProps {
  monthLabel: string;
  groups: CalendarTransactionGroup[];
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * 월별 전체내역은 선택한 월의 거래가 없을 때 빈 상태 카드로 자연스럽게 안내합니다.
 */
export default function TransactionHistorySection({
  monthLabel,
  groups,
  emptyTitle,
  emptyDescription,
}: TransactionHistorySectionProps) {
  const totalSpent = groups.reduce((sum, group) => sum + group.dailySpent, 0);

  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{monthLabel}</Text>
        <Text style={styles.totalSpent}>
          {groups.length > 0 ? `-₩${totalSpent.toLocaleString()}` : '내역 없음'}
        </Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={wp(26)} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{emptyDescription}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {groups.map((group) => (
            <View key={group.id} style={styles.groupBlock}>
              <Text style={styles.groupLabel}>{group.dateLabel}</Text>

              <View style={styles.groupCard}>
                {group.items.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.rowCard, index < group.items.length - 1 && styles.rowDivider]}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                        <Ionicons
                          name={item.icon as keyof typeof Ionicons.glyphMap}
                          size={wp(20)}
                          color={COLORS.textPrimary}
                        />
                      </View>
                      <View style={styles.textBlock}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          {item.isFixedExpense ? (
                            <Ionicons name="pin" size={wp(12)} color={COLORS.primary} />
                          ) : null}
                        </View>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>
                    </View>

                    <View style={styles.amountBlock}>
                      <Text style={[styles.amount, item.amount < 0 && styles.incomeAmount]}>
                        {item.amount < 0 ? '+' : '-'}₩{Math.abs(item.amount).toLocaleString()}
                      </Text>
                      {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalSpent: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: '#D87272',
  },
  list: {
    gap: hp(16),
    marginTop: hp(18),
  },
  emptyCard: {
    marginTop: hp(18),
    borderRadius: RADIUS.xl,
    backgroundColor: '#FBFAFF',
    paddingHorizontal: wp(18),
    paddingVertical: hp(24),
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: hp(10),
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptyDescription: {
    marginTop: hp(6),
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  groupBlock: {
    gap: hp(8),
  },
  groupLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
  groupCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#FBFAFF',
    paddingHorizontal: wp(14),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(13),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(4),
  },
  itemTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  itemCategory: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: hp(4),
  },
  amount: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: '#D87272',
  },
  incomeAmount: {
    color: '#6DBA7C',
  },
  time: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
});
