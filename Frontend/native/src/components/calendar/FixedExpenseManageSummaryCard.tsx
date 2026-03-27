import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface FixedExpenseManageSummaryCardProps {
  totalAmount: number;
  onPressAdd: () => void;
}

export default function FixedExpenseManageSummaryCard({
  totalAmount,
  onPressAdd,
}: FixedExpenseManageSummaryCardProps) {
  return (
    <View
      style={{
        marginHorizontal: wp(20),
        marginTop: hp(8),
        marginBottom: hp(22),
        borderRadius: RADIUS.xxl,
        backgroundColor: COLORS.fixedExpenseSummaryBackground,
        paddingHorizontal: wp(18),
        paddingVertical: hp(16),
      }}
    >
      <View
        className="flex-row items-center justify-between"
        style={{ gap: wp(12) }}
      >
        <View className="flex-1">
          <Text
            style={{
              fontSize: fp(13),
              fontFamily: FONTS.medium,
              color: COLORS.summaryTextLight,
              marginBottom: hp(8),
            }}
          >
            {'\uC774\uBC88 \uB2EC \uACE0\uC815\uC9C0\uCD9C \uD569\uACC4'}
          </Text>
          <Text
            style={{
              fontSize: fp(28),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
          >
            {`${totalAmount.toLocaleString()}\uC6D0`}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.88}
          className="items-center justify-center"
          style={{
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.addButtonBackground,
            minWidth: wp(120),
            paddingHorizontal: wp(18),
            paddingVertical: hp(10),
            shadowColor: COLORS.gradientStart,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 2,
          }}
          onPress={onPressAdd}
          >
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.bold,
                color: COLORS.textInverse,
              }}
            >
              {'+ \uACE0\uC815\uC9C0\uCD9C \uB4F1\uB85D'}
            </Text>
          </TouchableOpacity>
      </View>
      <Text
        style={{
          marginTop: hp(10),
          fontSize: fp(12),
          fontFamily: FONTS.medium,
          color: COLORS.summaryTextHint,
          lineHeight: fp(18),
        }}
      >
        {
          '\uB0A9\uBD80 \uC608\uC815\uC778 \uACE0\uC815\uC9C0\uCD9C\uB97C \uD55C \uBC88\uC5D0 \uD655\uC778\uD558\uACE0 \uD56D\uBAA9\uBCC4\uB85C \uAD00\uB9AC\uD560 \uC218 \uC788\uC5B4\uC694.'
        }
      </Text>
    </View>
  );
}
