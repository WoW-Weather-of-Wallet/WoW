import React from 'react';

import type { HomeScheduleItem } from '../../mock/dashboard';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import HomeScheduleEmptyState from './HomeScheduleEmptyState';
import HomeScheduleItemCard from './HomeScheduleItemCard';

interface HomeScheduleSectionProps {
  items: HomeScheduleItem[];
}

export default function HomeScheduleSection({
  items,
}: HomeScheduleSectionProps) {
  const hasItems = items.length > 0;

  return (
    <SurfaceCard>
      <SectionHeader
        title="결제 일정"
        actionLabel={hasItems ? `${items.length}건 예정` : '등록 전'}
      />

      {!hasItems ? (
        <HomeScheduleEmptyState
          title="예정된 결제 일정이 아직 없어요"
          description="고정 지출이나 결제 예정 내역을 추가하면 이곳에서 한눈에 확인할 수 있어요."
        />
      ) : (
        items.map((item) => <HomeScheduleItemCard key={item.id} item={item} />)
      )}
    </SurfaceCard>
  );
}
