import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import {
  getFixedExpenseEnabledLabel,
  getFixedExpenseIconColor,
  stripFixedExpenseCategorySuffix,
} from '../../utils/fixedExpensePresentation';

export interface ManageFixedExpenseItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  iconTone: string;
  isEnabled: boolean;
}

interface FixedExpenseManageItemCardProps {
  item: ManageFixedExpenseItem;
  onPressEdit: (id: string) => void;
  onToggleItem: (id: string, nextValue: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export default function FixedExpenseManageItemCard({
  item,
  onPressEdit,
  onToggleItem,
  onDeleteItem,
}: FixedExpenseManageItemCardProps) {
  return (
    <View
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.background,
        paddingHorizontal: wp(16),
        paddingVertical: hp(16),
        gap: hp(12),
      }}
    >
      <View
        className="flex-row items-start justify-between"
        style={{ gap: wp(12) }}
      >
        <View className="flex-1 flex-row items-center" style={{ gap: wp(12) }}>
          <View
            className="items-center justify-center"
            style={{
              width: wp(46),
              height: wp(46),
              borderRadius: wp(17),
              backgroundColor: item.iconTone,
            }}
          >
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={wp(22)}
              color={getFixedExpenseIconColor(item.iconTone)}
            />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={2}
              style={{
                fontSize: fp(17),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(4),
              }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {stripFixedExpenseCategorySuffix(item.subtitle)}
            </Text>
          </View>
        </View>

        <View style={{ minWidth: wp(82), alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {`${item.amount.toLocaleString()}\uC6D0`}
          </Text>
        </View>
      </View>

      <View
        className="flex-row items-center justify-between"
        style={{ gap: wp(12), paddingTop: hp(4) }}
      >
        <View className="flex-row items-center" style={{ gap: wp(8), flexWrap: 'wrap', flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.stepperButtonBackground,
              paddingHorizontal: wp(12),
              paddingVertical: hp(7),
            }}
            onPress={() => onPressEdit(item.id)}
          >
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary,
              }}
            >
              {'\uC218\uC815'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.deleteChipBackground,
              paddingHorizontal: wp(12),
              paddingVertical: hp(7),
            }}
            onPress={() => onDeleteItem(item.id)}
          >
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.semiBold,
                color: COLORS.spentRed,
              }}
            >
              {'\uC0AD\uC81C'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center" style={{ gap: wp(6), flexShrink: 0, marginLeft: wp(8) }}>
          <Text
            style={{
              fontSize: fp(12),
              fontFamily: FONTS.semiBold,
              color: COLORS.textSecondary,
              minWidth: wp(34),
              textAlign: 'right',
            }}
          >
            {getFixedExpenseEnabledLabel(item.isEnabled)}
          </Text>
          <Switch
            value={item.isEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={COLORS.white}
            onValueChange={(nextValue) => onToggleItem(item.id, nextValue)}
          />
        </View>
      </View>
    </View>
  );
}
