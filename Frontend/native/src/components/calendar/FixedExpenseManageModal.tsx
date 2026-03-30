import React from 'react';
import { Modal, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AiStackHeader from '../ai/AiStackHeader';
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
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

        <View
          style={{
            paddingTop: insets.top,
            paddingHorizontal: wp(20),
            paddingBottom: hp(6),
          }}
        >
          <AiStackHeader
            title="고정지출 관리"
            showBackButton
            onPressBack={onClose}
          />
        </View>

        <FixedExpenseManageSummaryCard
          totalAmount={totalAmount}
          onPressAdd={onPressAdd}
        />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: wp(20),
            paddingTop: hp(4),
            paddingBottom: insets.bottom + hp(28),
            gap: hp(12),
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
