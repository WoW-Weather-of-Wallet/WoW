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
        actionLabel={hasItems ? `${items.length}건 예정` : '내역 없음'}
      />

      {!hasItems ? (
        <HomeScheduleEmptyState
          title="아직 확인할 결제 일정이 없어요"
          description="거래내역이나 고정 지출이 쌓이면 다음 결제 흐름을 이곳에서 바로 확인할 수 있어요."
        />
      ) : (
        items.map((item) => <HomeScheduleItemCard key={item.id} item={item} />)
      )}
    </SurfaceCard>
  );
}
