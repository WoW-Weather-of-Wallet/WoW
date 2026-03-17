import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { HomeScheduleItem } from '../../mock/dashboard';

interface HomeScheduleSectionProps {
  items: HomeScheduleItem[];
}

export default function HomeScheduleSection({
  items,
}: HomeScheduleSectionProps) {
  return (
    <SurfaceCard>
      <SectionHeader title="다가오는 결제 일정" actionLabel="3건" />
      {items.map((item) => (
        <View key={item.id} style={styles.scheduleCard}>
          <View style={styles.flex1}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
          </View>
          <View style={styles.scheduleRight}>
            <Text style={styles.scheduleAmount}>{item.amount}</Text>
            <Text style={styles.scheduleStatus}>
              {item.status === 'paid' ? '완료' : '예정'}
            </Text>
          </View>
        </View>
      ))}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(4),
    gap: wp(12),
  },
  scheduleTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  scheduleSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  scheduleRight: { alignItems: 'flex-end' },
  scheduleAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  scheduleStatus: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.warning,
  },
});
