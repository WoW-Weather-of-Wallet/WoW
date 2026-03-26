import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import CustomTextInput from '../common/CustomTextInput';
import { COLORS, wp } from '../../constants/theme';
import { useFixedExpenseDetailForm, type FixedExpenseDetailItem } from '../../hooks';
import { styles } from './FixedExpenseDetailSheet.styles';

interface FixedExpenseDetailSheetProps {
  visible: boolean;
  item: FixedExpenseDetailItem | null;
  mode?: 'create' | 'edit';
  initialCategory?: string;
  initialPaymentDay?: number;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (payload: { category: string; paymentDay: number; amount: number }) => void;
}

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
  const {
    isEditMode,
    resolvedCategory,
    paymentDay,
    amountInput,
    sheetTitle,
    sheetSubtitle,
    aiHintTitle,
    aiHintText,
    amountPreviewLabel,
    handleChangeAmountInput,
    decreasePaymentDay,
    increasePaymentDay,
    handleSubmit,
  } = useFixedExpenseDetailForm({
    visible,
    item,
    mode,
    initialCategory,
    initialPaymentDay,
    onSubmit,
  });

  if (!item) {
    return null;
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={sheetTitle}
      subtitle={sheetSubtitle}
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
        <Text style={styles.aiHintTitle}>{aiHintTitle}</Text>
        <Text style={styles.aiHintText}>{aiHintText}</Text>
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
              <Text style={styles.readonlyValue}>{resolvedCategory}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>금액</Text>
          <CustomTextInput
            label="고정지출 금액을 입력해주세요"
            value={amountInput}
            onChangeText={handleChangeAmountInput}
            keyboardType="number-pad"
            containerStyle={styles.amountInput}
          />
          <Text style={styles.amountPreview}>{amountPreviewLabel}</Text>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>매월 납부일</Text>
      <View style={styles.stepperCard}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.stepperButton}
          onPress={decreasePaymentDay}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{paymentDay}</Text>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.stepperButton}
          onPress={increasePaymentDay}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
