import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { FixedExpenseItem } from '../../mock/calendar';
import {
  getFixedExpenseEnabledLabel,
  stripFixedExpenseCategorySuffix,
} from '../../utils/fixedExpensePresentation';

interface FixedExpenseGroupDetail {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  isEnabled: boolean;
  category: string;
}

interface FixedExpenseGroupBlockProps {
  item: FixedExpenseItem;
  detailItems: FixedExpenseGroupDetail[];
  onToggleExpand: (id: string) => void;
}

const statusStyles = {
  done: {
    backgroundColor: COLORS.statusDoneBackground,
    color: COLORS.statusDoneText,
  },
  countdown: {
    backgroundColor: COLORS.statusWarningBackground,
    color: COLORS.statusWarningText,
  },
  pending: {
    backgroundColor: COLORS.backgroundSecondary,
    color: COLORS.textSecondary,
  },
} as const;

export default function FixedExpenseGroupBlock({
  item,
  detailItems,
  onToggleExpand,
}: FixedExpenseGroupBlockProps) {
  return (
    <View style={{ gap: hp(8) }}>
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-row items-center justify-between"
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.fixedExpenseRowBackground,
          paddingHorizontal: wp(14),
          paddingVertical: hp(14),
        }}
        onPress={() => onToggleExpand(item.id)}
      >
        <View className="flex-1 flex-row items-center" style={{ gap: wp(12) }}>
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
          <View className="flex-1">
            <Text
              style={{
                fontSize: fp(18),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(4),
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {item.subtitle}
            </Text>
          </View>
        </View>

        <View className="items-end" style={{ gap: hp(6) }}>
          {item.statusLabel ? (
            <View
              style={{
                borderRadius: RADIUS.full,
                paddingHorizontal: wp(10),
                paddingVertical: hp(4),
                backgroundColor: statusStyles[item.statusTone].backgroundColor,
              }}
            >
              <Text
                style={{
                  fontSize: fp(11),
                  fontFamily: FONTS.semiBold,
                  color: statusStyles[item.statusTone].color,
                }}
              >
                {item.statusLabel}
              </Text>
            </View>
          ) : null}
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {item.amount > 0 ? `${item.amount.toLocaleString()}원` : '-'}
          </Text>
          <Ionicons
            name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
            size={wp(16)}
            color={COLORS.textTertiary}
          />
        </View>
      </TouchableOpacity>

      {item.isExpanded ? (
        <View
          style={{
            borderRadius: RADIUS.xl,
            backgroundColor: COLORS.backgroundSecondary,
            paddingHorizontal: wp(14),
            paddingVertical: hp(12),
            gap: hp(10),
          }}
        >
          {detailItems.length > 0 ? (
            detailItems.map((detail) => (
              <View
                key={detail.id}
                className="flex-row items-center justify-between"
                style={{ gap: wp(12) }}
              >
                <View className="flex-1" style={{ gap: hp(4) }}>
                  <View
                    className="flex-row items-center"
                    style={{ gap: wp(8), flexWrap: 'wrap' }}
                  >
                    <Text
                      style={{
                        fontSize: fp(14),
                        fontFamily: FONTS.bold,
                        color: COLORS.textPrimary,
                      }}
                    >
                      {detail.title}
                    </Text>
                    <View
                      style={{
                        borderRadius: RADIUS.full,
                        backgroundColor: COLORS.primary50,
                        paddingHorizontal: wp(8),
                        paddingVertical: hp(4),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fp(11),
                          fontFamily: FONTS.semiBold,
                          color: COLORS.primary,
                        }}
                      >
                        {detail.category}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: fp(12),
                      fontFamily: FONTS.medium,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {stripFixedExpenseCategorySuffix(detail.subtitle, detail.category)}
                  </Text>
                </View>

                <View className="items-end" style={{ gap: hp(4) }}>
                  <Text
                    style={{
                      fontSize: fp(14),
                      fontFamily: FONTS.bold,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {`${detail.amount.toLocaleString()}원`}
                  </Text>
                  <Text
                    style={{
                      fontSize: fp(11),
                      fontFamily: FONTS.medium,
                      color: COLORS.textTertiary,
                    }}
                  >
                    {getFixedExpenseEnabledLabel(detail.isEnabled)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              -
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
