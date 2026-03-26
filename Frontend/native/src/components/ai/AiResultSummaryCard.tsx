import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export interface AiResultSummaryCardProps {
  title: string;
  description: string;
  headline?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  iconText?: string;
}

export default function AiResultSummaryCard({
  title,
  description,
  headline,
  iconName,
  iconText,
}: AiResultSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {headline ? <Text style={styles.headline}>{headline}</Text> : null}

      {iconName && iconText ? (
        <View style={styles.iconRow}>
          <Ionicons name={iconName} size={wp(20)} color={COLORS.primary} />
          <Text style={styles.iconText}>{iconText}</Text>
        </View>
      ) : null}

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: wp(20),
    marginBottom: hp(24),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(16),
  },
  headline: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: fp(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: fp(20),
    marginTop: hp(8),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginLeft: wp(8),
  },
});
