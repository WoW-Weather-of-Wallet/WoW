import React from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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
  return iconTone === '#111111' ? '#FFFFFF' : COLORS.textPrimary;
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

        <View style={[styles.header, { paddingTop: insets.top + hp(12) }]}>
          <TouchableOpacity activeOpacity={0.86} style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={wp(18)} color={COLORS.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>고정지출 관리</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>활성화된 고정지출 합계</Text>
          <Text style={styles.summaryAmount}>₩{totalAmount.toLocaleString()}</Text>
          <Text style={styles.summaryHint}>자동으로 반영할 항목을 켜 두면 캘린더 요약에 함께 표시됩니다.</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + hp(28) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.88} style={styles.addButton} onPress={onPressAdd}>
              <Text style={styles.addButtonText}>+ 항목 추가</Text>
            </TouchableOpacity>
          </View>

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
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                <Text style={styles.itemAmount}>₩{item.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.controlRow}>
                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.editChip}
                  onPress={() => onPressEdit(item.id)}
                >
                  <Text style={styles.editChipText}>수정</Text>
                </TouchableOpacity>
                <Switch
                  value={item.isEnabled}
                  trackColor={{ false: '#DDDCF0', true: '#B8B1FF' }}
                  thumbColor="#FFFFFF"
                  onValueChange={(nextValue) => onToggleItem(item.id, nextValue)}
                />
                <TouchableOpacity activeOpacity={0.86} onPress={() => onDeleteItem(item.id)}>
                  <Text style={styles.deleteText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: wp(20),
    paddingBottom: hp(18),
  },
  backButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF1E',
  },
  headerTitle: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  summaryCard: {
    marginHorizontal: wp(20),
    marginTop: hp(-6),
    marginBottom: hp(18),
    borderRadius: RADIUS.xxl,
    backgroundColor: '#8E84F5',
    paddingHorizontal: wp(18),
    paddingVertical: hp(20),
  },
  summaryLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: '#E4E0FF',
    marginBottom: hp(8),
  },
  summaryAmount: {
    fontSize: fp(30),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  summaryHint: {
    marginTop: hp(8),
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#ECE8FF',
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    gap: hp(14),
  },
  actionRow: {
    alignItems: 'flex-end',
  },
  addButton: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(18),
    paddingVertical: hp(10),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  addButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  itemCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    gap: hp(14),
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp(12),
  },
  iconWrap: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  itemSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  itemAmount: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    flexShrink: 0,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: wp(10),
  },
  editChip: {
    borderRadius: RADIUS.full,
    backgroundColor: '#EFEEFF',
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  editChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  deleteText: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: '#D87272',
  },
});
