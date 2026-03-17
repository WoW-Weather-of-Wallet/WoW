import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { HomeInsight } from '../../mock/dashboard';

interface HomeInsightSectionProps {
  items: HomeInsight[];
}

export default function HomeInsightSection({
  items,
}: HomeInsightSectionProps) {
  return (
    <SurfaceCard>
      <SectionHeader title="이번 달 핵심 지표" actionLabel="더보기" />
      {items.map((item) => (
        <View key={item.id} style={styles.infoCard}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
          <Text style={styles.infoChange}>{item.changeText}</Text>
        </View>
      ))}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: wp(16),
  },
  infoLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(8),
  },
  infoValue: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  infoChange: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
