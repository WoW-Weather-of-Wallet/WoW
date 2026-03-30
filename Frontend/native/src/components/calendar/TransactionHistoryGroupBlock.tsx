import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarTransactionGroup } from '../../mock/calendar';

interface TransactionHistoryGroupBlockProps {
  group: CalendarTransactionGroup;
}

export default function TransactionHistoryGroupBlock({
  group,
}: TransactionHistoryGroupBlockProps) {
  return (
    <View style={{ gap: hp(8) }}>
      <Text
        style={{
          fontSize: fp(13),
          fontFamily: FONTS.semiBold,
          color: COLORS.textTertiary,
        }}
      >
        {group.dateLabel}
      </Text>

      <View
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.transactionBackground,
          paddingHorizontal: wp(14),
        }}
      >
        {group.items.map((item, index) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between"
            style={{
              paddingVertical: hp(13),
              borderBottomWidth: index < group.items.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <View className="flex-1 flex-row items-center" style={{ gap: wp(12), minWidth: 0 }}>
              <View
                className="items-center justify-center"
                style={{
                  width: wp(44),
                  height: wp(44),
                  borderRadius: wp(18),
                  backgroundColor: item.iconTone,
                }}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={wp(20)}
                  color={COLORS.textPrimary}
                />
              </View>

              <View className="flex-1" style={{ minWidth: 0 }}>
                <View
                  className="flex-row items-center"
                  style={{ gap: wp(6), marginBottom: hp(4), minWidth: 0 }}
                >
                  <Text
                    style={{
                      fontSize: fp(16),
                      fontFamily: FONTS.bold,
                      color: COLORS.textPrimary,
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.isFixedExpense ? (
                    <View
                      className="items-center justify-center"
                      style={{
                        width: wp(20),
                        height: wp(20),
                        borderRadius: RADIUS.full,
                        backgroundColor: COLORS.primary50,
                        flexShrink: 0,
                      }}
                    >
                      <Ionicons name="bookmark" size={wp(11)} color={COLORS.primary} />
                    </View>
                  ) : null}
                </View>
                <Text
                  style={{
                    fontSize: fp(13),
                    fontFamily: FONTS.medium,
                    color: COLORS.textSecondary,
                  }}
                  numberOfLines={1}
                >
                  {item.category}
                </Text>
              </View>
            </View>

            <View className="items-end" style={{ gap: hp(4), paddingLeft: wp(10) }}>
              <Text
                style={{
                  fontSize: fp(15),
                  fontFamily: FONTS.bold,
                  color: item.amount < 0 ? COLORS.incomeGreen : COLORS.spentRed,
                }}
              >
                {`${item.amount < 0 ? '+' : '-'}${Math.abs(item.amount).toLocaleString()}원`}
              </Text>
              {item.time ? (
                <Text
                  style={{
                    fontSize: fp(12),
                    fontFamily: FONTS.medium,
                    color: COLORS.textTertiary,
                  }}
                >
                  {item.time}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
