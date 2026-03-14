import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

type ReasonTone = 'red' | 'purple' | 'green';

interface ReasonHighlightCardProps {
  title: string;
  description: string;
  tone: ReasonTone;
}

const toneStyles: Record<ReasonTone, { backgroundColor: string }> = {
  red: { backgroundColor: '#FFF1F0' },
  purple: { backgroundColor: '#F2F1FF' },
  green: { backgroundColor: '#F1FAEA' },
};

/**
 * AI 분석 사유를 색상별 카드로 보여주는 공통 블록.
 * 배경 톤만 바뀌고 구조는 같아서 하나의 컴포넌트로 관리한다.
 */
export default function ReasonHighlightCard({
  title,
  description,
  tone,
}: ReasonHighlightCardProps) {
  return (
    <View style={[styles.card, toneStyles[tone]]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(12),
  },
  title: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  description: {
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
