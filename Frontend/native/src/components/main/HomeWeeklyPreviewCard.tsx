import React from 'react';
import { View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import {
  buildWeeklyPreviewItems,
  HOME_WEEKLY_PREVIEW_WEEKDAYS,
} from '../../utils/mainHomePresentation';
import { styles } from './HomeWeeklyPreviewCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';
import HomeWeeklyPreviewDayColumn from './HomeWeeklyPreviewDayColumn';

interface HomeWeeklyPreviewCardProps {
  items: CalendarDayItem[];
}

export default function HomeWeeklyPreviewCard({ items }: HomeWeeklyPreviewCardProps) {
  const displayItems = buildWeeklyPreviewItems(items);

  return (
    <SurfaceCard>
      <SectionHeader title="주간 미리보기" actionLabel="-" />
      <View style={styles.previewStrip}>
        {displayItems.map((day, index) => (
          <HomeWeeklyPreviewDayColumn
            key={day.dateKey}
            day={day}
            weekdayLabel={HOME_WEEKLY_PREVIEW_WEEKDAYS[index] ?? '-'}
            index={index}
          />
        ))}
      </View>
    </SurfaceCard>
  );
}
