import React from 'react';
import type { HomeSpendingTypeReason } from '../../hooks/useHomeSpendingTypeSummary';
import ReasonHighlightCard from './ReasonHighlightCard';
import HomeSpendingTypeSectionTitle from './HomeSpendingTypeSectionTitle';

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
      <HomeSpendingTypeSectionTitle title={title} />
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
