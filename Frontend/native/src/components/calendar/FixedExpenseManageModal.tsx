import React from 'react';
import { Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from './FixedExpenseManageModal.styles';
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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.gradientStart} />

        <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
          <TouchableOpacity activeOpacity={0.86} style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={wp(18)} color={COLORS.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고정지출 관리</Text>
        </View>

        <FixedExpenseManageSummaryCard totalAmount={totalAmount} onPressAdd={onPressAdd} />

        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + hp(28) },
          ]}
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
