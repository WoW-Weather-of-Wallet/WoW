import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './FixedExpenseManageModal.styles';
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
    <View style={styles.itemCard}>
      <View style={styles.itemTopRow}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={wp(22)}
              color={getFixedExpenseIconColor(item.iconTone)}
            />
          </View>

          <View style={styles.itemTextBlock}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemSubtitle} numberOfLines={2}>
              {stripFixedExpenseCategorySuffix(item.subtitle)}
            </Text>
          </View>
        </View>

        <View style={styles.itemAmountBlock}>
          <Text style={styles.itemAmount}>{item.amount.toLocaleString()}원</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <View style={styles.controlActions}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.editChip}
            onPress={() => onPressEdit(item.id)}
          >
            <Text style={styles.editChipText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.deleteChip}
            onPress={() => onDeleteItem(item.id)}
          >
            <Text style={styles.deleteChipText}>삭제</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.switchWrap}>
          <Text style={styles.switchLabel}>{getFixedExpenseEnabledLabel(item.isEnabled)}</Text>
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
