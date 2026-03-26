import React from 'react';

import type { HomeInsight } from '../../mock/dashboard';
import { buildHomeInsightDisplayItems } from '../../utils/mainHomePresentation';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import HomeInsightCard from './HomeInsightCard';

interface HomeInsightSectionProps {
  items: HomeInsight[];
}

export default function HomeInsightSection({
  items,
}: HomeInsightSectionProps) {
  const displayItems = buildHomeInsightDisplayItems(items);

  return (
    <SurfaceCard>
      <SectionHeader title="?뚮퉬 ?몄궗?댄듃" actionLabel="-" />
      {displayItems.map(item => (
        <HomeInsightCard key={item.id} item={item} />
      ))}
    </SurfaceCard>
  );
}
