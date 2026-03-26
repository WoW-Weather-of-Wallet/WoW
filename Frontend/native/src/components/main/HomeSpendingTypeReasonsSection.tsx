import React from 'react';
import { Text } from 'react-native';
import type { HomeSpendingTypeReason } from '../../hooks/useHomeSpendingTypeSummary';
import ReasonHighlightCard from './ReasonHighlightCard';
import { styles } from './HomeSpendingTypeSheet.styles';

interface HomeSpendingTypeReasonsSectionProps {
  title: string;
  reasons: HomeSpendingTypeReason[];
}

export default function HomeSpendingTypeReasonsSection({
  title,
  reasons,
}: HomeSpendingTypeReasonsSectionProps) {
  return (
    <>
      <Text style={styles.sheetSectionTitle}>{title}</Text>
      {reasons.map((reason, index) => (
        <ReasonHighlightCard
          key={`${reason.title}-${index}`}
          title={reason.title}
          description={reason.description}
          tone={reason.tone}
        />
      ))}
    </>
  );
}
