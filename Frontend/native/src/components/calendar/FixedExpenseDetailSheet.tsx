import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './FixedExpenseDetailSheet.styles';

interface SelectedTransactionItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

interface FixedExpenseDetailSheetProps {
  visible: boolean;
  item: SelectedTransactionItem | null;
  initialCategory?: string;
  initialPaymentDay?: number;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (payload: { category: string; paymentDay: number }) => void;
}

const CATEGORY_OPTIONS = ['식비', '교통', '쇼핑', '여가', '주거', '의료', '통신', '기타'] as const;

/**
 * 거래를 고정지출로 등록하거나 수정할 때 쓰는 세부 설정 시트입니다.
 */
export default function FixedExpenseDetailSheet({
  visible,
  item,
  initialCategory,
  initialPaymentDay,
  submitLabel = '고정지출로 등록하기',
  onClose,
  onSubmit,
}: FixedExpenseDetailSheetProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('여가');
  const [paymentDay, setPaymentDay] = useState(11);

  const recommendedCategory = useMemo(() => item?.category ?? '여가', [item]);

  useEffect(() => {
    if (!visible || !item) {
      return;
    }

    // 수정 진입 시에는 기존 값을 유지하고, 신규 등록이면 거래 카테고리 기준으로 시작합니다.
    setSelectedCategory(initialCategory ?? item.category);
    setPaymentDay(initialPaymentDay ?? 11);
  }, [initialCategory, initialPaymentDay, item, visible]);

  if (!item) {
    return null;
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="세부 설정"
      subtitle={`"${item.title}"를 고정지출로 연결하는 단계입니다.`}
    >
      <View style={styles.selectedCard}>
        <View style={styles.selectedLeft}>
          <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={wp(18)}
              color={item.iconTone === '#111111' ? COLORS.white : COLORS.textPrimary}
            />
          </View>
          <View>
            <Text style={styles.selectedTitle}>{item.title}</Text>
            <Text style={styles.selectedAmount}>-₩{item.amount.toLocaleString()}</Text>
          </View>
        </View>
        <Ionicons name="pin" size={wp(18)} color={COLORS.primary} />
      </View>

      <View style={styles.aiHintCard}>
        <Text style={styles.aiHintTitle}>AI 추천: "{recommendedCategory}" 카테고리</Text>
        <Text style={styles.aiHintText}>
          거래명과 기존 소비 흐름을 기준으로 가장 가까운 카테고리를 먼저 제안합니다.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>카테고리 선택</Text>
      <View style={styles.categoryWrap}>
        {CATEGORY_OPTIONS.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.86}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>매월 납부일</Text>
      <View style={styles.stepperCard}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.stepperButton}
          onPress={() => setPaymentDay((current) => Math.max(1, current - 1))}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{paymentDay}</Text>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.stepperButton}
          onPress={() => setPaymentDay((current) => Math.min(31, current + 1))}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.submitButton}
        onPress={() => onSubmit({ category: selectedCategory, paymentDay })}
      >
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

