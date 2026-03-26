import React from 'react';

import type { HomeSpendingCategory } from '../../mock/dashboard';
import { buildHomeCategoryDisplayItems } from '../../utils/mainHomePresentation';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import HomeCategoryItemRow from './HomeCategoryItemRow';

interface HomeCategorySectionProps {
  items: HomeSpendingCategory[];
}

export default function HomeCategorySection({
  items,
}: HomeCategorySectionProps) {
  const displayItems = buildHomeCategoryDisplayItems(items);

  return (
    <SurfaceCard>
      <SectionHeader title="移댄뀒怨좊━蹂??뚮퉬" actionLabel="-" />
      {displayItems.map(category => (
        <HomeCategoryItemRow
          key={category.id}
          category={category}
          showAmount={items.length > 0}
        />
      ))}
    </SurfaceCard>
  );
}
