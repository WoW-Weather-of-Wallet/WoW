import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './TransactionHistorySection.styles';
import type { CalendarTransactionGroup } from '../../mock/calendar';
import TransactionHistoryGroupBlock from './TransactionHistoryGroupBlock';

interface TransactionHistorySectionProps {
  monthLabel: string;
  groups: CalendarTransactionGroup[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function TransactionHistorySection({
  monthLabel,
  groups,
  emptyTitle,
  emptyDescription,
}: TransactionHistorySectionProps) {
  const totalSpent = groups.reduce((sum, group) => sum + group.dailySpent, 0);

  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{monthLabel}</Text>
        <Text style={styles.totalSpent}>
          {groups.length > 0 ? `-₩${totalSpent.toLocaleString()}` : '내역 없음'}
        </Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={wp(26)} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyDescription}>{emptyDescription}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {groups.map((group) => (
            <TransactionHistoryGroupBlock key={group.id} group={group} />
          ))}
        </View>
      )}
    </SurfaceCard>
  );
}
