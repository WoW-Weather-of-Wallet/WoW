import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './TransactionHistorySection.styles';
import type { CalendarTransactionGroup, CalendarTransactionItem } from '../../mock/calendar';

interface TransactionHistorySectionProps {
  monthLabel: string;
  groups: CalendarTransactionGroup[];
  emptyTitle: string;
  emptyDescription: string;
  onDeleteTransaction?: (transactionId: number, dateKey: string, title: string) => void;
}

export default function TransactionHistorySection({
  monthLabel,
  groups,
  emptyTitle,
  emptyDescription,
  onDeleteTransaction,
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
            <View key={group.id} style={styles.groupBlock}>
              <Text style={styles.groupLabel}>{group.dateLabel}</Text>

              <View style={styles.groupCard}>
                {group.items.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.rowCard, index < group.items.length - 1 && styles.rowDivider]}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                        <Ionicons
                          name={item.icon as keyof typeof Ionicons.glyphMap}
                          size={wp(20)}
                          color={COLORS.textPrimary}
                        />
                      </View>

                      <View style={styles.textBlock}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          {item.isFixedExpense ? (
                            <Ionicons name="pin" size={wp(12)} color={COLORS.primary} />
                          ) : null}
                        </View>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </View>
                    </View>

                    <View style={styles.amountBlock}>
                      <Text style={[styles.amount, item.amount < 0 && styles.incomeAmount]}>
                        {item.amount < 0 ? '+' : '-'}₩{Math.abs(item.amount).toLocaleString()}
                      </Text>
                      {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
                      {canDeleteTransaction(item) && onDeleteTransaction ? (
                        <Pressable
                          style={styles.deleteChip}
                          onPress={() =>
                            onDeleteTransaction(
                              item.backendTransactionId as number,
                              group.id,
                              item.title,
                            )
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={wp(12)}
                            color={COLORS.spentRed}
                          />
                          <Text style={styles.deleteChipText}>삭제</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </SurfaceCard>
  );
}

function canDeleteTransaction(item: CalendarTransactionItem) {
  // 고정지출로 연결된 거래는 삭제 시 다른 화면 상태와 꼬일 수 있어
  // 히스토리에서 바로 삭제하지 않도록 제한합니다.
  return item.backendTransactionId != null && !item.isFixedExpense;
}
