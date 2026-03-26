import React from 'react';
import { Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import FixedExpenseManageItemCard, {
  type ManageFixedExpenseItem,
} from './FixedExpenseManageItemCard';
import FixedExpenseManageSummaryCard from './FixedExpenseManageSummaryCard';

interface FixedExpenseManageModalProps {
  visible: boolean;
  totalAmount: number;
  items: ManageFixedExpenseItem[];
  onClose: () => void;
  onPressAdd: () => void;
  onPressEdit: (id: string) => void;
  onToggleItem: (id: string, nextValue: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export default function FixedExpenseManageModal({
  visible,
  totalAmount,
  items,
  onClose,
  onPressAdd,
  onPressEdit,
  onToggleItem,
  onDeleteItem,
}: FixedExpenseManageModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: COLORS.backgroundSecondary }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />

        <View
          className="flex-row items-center"
          style={{
            gap: wp(12),
            backgroundColor: COLORS.gradientStart,
            paddingTop: insets.top + 2,
            paddingHorizontal: wp(20),
            paddingBottom: 4,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              width: wp(30),
              height: wp(30),
              borderRadius: wp(15),
              backgroundColor: COLORS.headerButtonBackground,
            }}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={wp(18)} color={COLORS.textInverse} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: fp(19),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
          >
            {'\uACE0\uC815\uC9C0\uCD9C \uAD00\uB9AC'}
          </Text>
        </View>

        <FixedExpenseManageSummaryCard
          totalAmount={totalAmount}
          onPressAdd={onPressAdd}
        />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: wp(20),
            paddingTop: hp(6),
            paddingBottom: insets.bottom + hp(28),
            gap: hp(14),
          }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <FixedExpenseManageItemCard
              key={item.id}
              item={item}
              onPressEdit={onPressEdit}
              onToggleItem={onToggleItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
