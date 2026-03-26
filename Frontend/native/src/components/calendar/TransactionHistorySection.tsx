import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
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
      <View className="flex-row items-center justify-between">
        <Text
          style={{
            fontSize: fp(20),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {monthLabel}
        </Text>
        <Text
          style={{
            fontSize: fp(15),
            fontFamily: FONTS.bold,
            color: COLORS.spentRed,
          }}
        >
          {groups.length > 0 ? `-${totalSpent.toLocaleString()}원` : '지출 없음'}
        </Text>
      </View>

      {groups.length === 0 ? (
        <View
          className="items-center"
          style={{
            marginTop: hp(18),
            borderRadius: RADIUS.xl,
            backgroundColor: COLORS.transactionBackground,
            paddingHorizontal: wp(18),
            paddingVertical: hp(24),
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={wp(26)}
            color={COLORS.primary}
          />
          <Text
            style={{
              marginTop: hp(10),
              fontSize: fp(17),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {emptyTitle}
          </Text>
          <Text
            style={{
              marginTop: hp(6),
              fontSize: fp(13),
              lineHeight: fp(19),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            {emptyDescription}
          </Text>
        </View>
      ) : (
        <View style={{ gap: hp(16), marginTop: hp(18) }}>
          {groups.map((group) => (
            <TransactionHistoryGroupBlock key={group.id} group={group} />
          ))}
        </View>
      )}
    </SurfaceCard>
  );
}
