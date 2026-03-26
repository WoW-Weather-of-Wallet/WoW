import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import CustomTextInput from '../common/CustomTextInput';
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
  mode?: 'create' | 'edit';
  initialCategory?: string;
  initialPaymentDay?: number;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (payload: { category: string; paymentDay: number; amount: number }) => void;
}

/**
 * 거래를 고정지출로 등록하거나 수정할 때 쓰는 세부 설정 시트입니다.
 */
export default function FixedExpenseDetailSheet({
  visible,
  item,
  mode = 'create',
  initialCategory,
  initialPaymentDay,
  submitLabel = '고정지출로 등록하기',
  onClose,
  onSubmit,
}: FixedExpenseDetailSheetProps) {
  const [paymentDay, setPaymentDay] = useState(11);
  const [amountInput, setAmountInput] = useState('');
  const isEditMode = mode === 'edit';

  const recommendedCategory = useMemo(() => item?.category ?? '공연관람', [item]);

  useEffect(() => {
    if (!visible || !item) {
      return;
    }

    setPaymentDay(initialPaymentDay ?? 11);
    setAmountInput(String(item.amount));
  }, [initialCategory, initialPaymentDay, item, visible]);

  if (!item) {
    return null;
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={isEditMode ? '고정지출 수정' : '세부 설정'}
      subtitle={
        isEditMode
          ? `"${item.title}" 항목의 금액과 납부일을 변경할 수 있어요.`
          : `"${item.title}"를 고정지출로 연결하는 단계입니다.`
      }
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
        <Text style={styles.aiHintTitle}>
          {isEditMode ? '현재 항목 정보는 그대로 유지돼요' : '카테고리는 상세 조회에서만 확인'}
        </Text>
        <Text style={styles.aiHintText}>
          {isEditMode
            ? '수정 화면에서는 금액과 납부일을 바꿀 수 있고, 거래명과 카테고리는 현재 설정을 유지합니다.'
            : `등록 단계에서는 카테고리를 고르지 않고, 현재 거래 기준 분류를 그대로 유지합니다. 현재 분류는 "${recommendedCategory}"로 연결됩니다.`}
        </Text>
      </View>

      {isEditMode ? (
        <>
          <View style={styles.readonlyInfoCard}>
            <View style={styles.readonlyInfoRow}>
              <Text style={styles.readonlyLabel}>거래명</Text>
              <Text style={styles.readonlyValue}>{item.title}</Text>
            </View>
            <View style={styles.readonlyDivider} />
            <View style={styles.readonlyInfoRow}>
              <Text style={styles.readonlyLabel}>카테고리</Text>
              <Text style={styles.readonlyValue}>{initialCategory ?? item.category}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>금액</Text>
          <CustomTextInput
            label="고정지출 금액을 입력해주세요"
            value={amountInput}
            onChangeText={(text) => setAmountInput(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            containerStyle={styles.amountInput}
          />
          <Text style={styles.amountPreview}>
            {`₩${Number(amountInput || 0).toLocaleString()}`}
          </Text>
        </>
      ) : null}

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
        onPress={() =>
          onSubmit({
            category: initialCategory ?? item.category,
            paymentDay,
            amount: isEditMode ? Number(amountInput || item.amount) : item.amount,
          })
        }
      >
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
