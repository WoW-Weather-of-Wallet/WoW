import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { COLORS, wp } from '../../constants/theme';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { styles } from './HomeScheduleSection.styles';
import type { HomeScheduleItem } from '../../mock/dashboard';

interface HomeScheduleSectionProps {
  items: HomeScheduleItem[];
}

export default function HomeScheduleSection({
  items,
}: HomeScheduleSectionProps) {
  const hasItems = items.length > 0;

  return (
    <SurfaceCard>
      <SectionHeader title="결제 일정" actionLabel={hasItems ? `${items.length}건 예정` : '예정 없음'} />
      {!hasItems ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons
              name="calendar-clear-outline"
              size={wp(22)}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.emptyTextWrap}>
            <Text style={styles.emptyTitle}>등록된 결제 일정이 아직 없어요</Text>
            <Text style={styles.emptyDescription}>
              고정 지출이나 결제 예정 내역이 생기면 이곳에서 한눈에 확인할 수 있어요.
            </Text>
          </View>
        </View>
      ) : (
        items.map((item) => {
          const isPaid = item.status === 'paid';

          return (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.flex1}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
              </View>
              <View style={styles.scheduleRight}>
                <Text style={styles.scheduleAmount}>{item.amount}</Text>
                <View
                  style={[
                    styles.statusChip,
                    isPaid ? styles.statusChipDone : styles.statusChipUpcoming,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isPaid ? styles.statusChipTextDone : styles.statusChipTextUpcoming,
                    ]}
                  >
                    {isPaid ? '완료' : '예정'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </SurfaceCard>
  );
}
