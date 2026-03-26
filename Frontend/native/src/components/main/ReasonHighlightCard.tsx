import React from 'react';
import { Text, View } from 'react-native';

import { styles, toneStyles } from './ReasonHighlightCard.styles';
import type { ReasonHighlightCardProps } from './types';

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

