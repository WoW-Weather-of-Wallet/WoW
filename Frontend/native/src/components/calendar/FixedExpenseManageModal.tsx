import React from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from './FixedExpenseManageModal.styles';

interface ManageFixedExpenseItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: string;
  iconTone: string;
  isEnabled: boolean;
}

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

function getIconColor(iconTone: string) {
  return iconTone === '#111111' ? COLORS.white : COLORS.textPrimary;
}

/**
 * 고정지출 관리 전체 화면입니다. 등록된 항목의 수정, 활성화, 삭제를 한곳에서 처리합니다.
 */
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

        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>활성화된 고정지출 합계</Text>
              <Text style={styles.summaryAmount}>₩{totalAmount.toLocaleString()}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.88} style={styles.addButton} onPress={onPressAdd}>
              <Text style={styles.addButtonText}>+ 항목 추가</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.summaryHint}>자동으로 반영할 항목을 켜 두면 캘린더 요약에 함께 표시됩니다.</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + hp(28) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={wp(22)}
                      color={getIconColor(item.iconTone)}
                    />
                  </View>

                  <View style={styles.itemTextBlock}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={2}>
                      {stripCategoryFromSubtitle(item.subtitle)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemAmountBlock}>
                  <Text style={styles.itemAmount}>₩{item.amount.toLocaleString()}</Text>
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
                  <Text style={styles.switchLabel}>{item.isEnabled ? '활성' : '비활성'}</Text>
                  <Switch
                    value={item.isEnabled}
                    trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                    thumbColor={COLORS.white}
                    onValueChange={(nextValue) => onToggleItem(item.id, nextValue)}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function stripCategoryFromSubtitle(subtitle: string) {
  return subtitle.replace(/\s(식비|교통|쇼핑|여가|주거|의료|통신|기타)$/, '').trim();
}
