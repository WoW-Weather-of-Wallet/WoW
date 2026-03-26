import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import CustomTextInput from '../common/CustomTextInput';
import { useFixedExpenseDetailForm, type FixedExpenseDetailItem } from '../../hooks';
import FixedExpensePaymentDayStepper from './FixedExpensePaymentDayStepper';
import FixedExpenseReadonlyInfoCard from './FixedExpenseReadonlyInfoCard';
import FixedExpenseSelectedSummaryCard from './FixedExpenseSelectedSummaryCard';
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
  submitLabel = '고정지출 저장하기',
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
      <FixedExpenseSelectedSummaryCard item={item} />

      <View style={styles.aiHintCard}>
        <Text style={styles.aiHintTitle}>{aiHintTitle}</Text>
        <Text style={styles.aiHintText}>{aiHintText}</Text>
      </View>

      {isEditMode ? (
        <>
          <FixedExpenseReadonlyInfoCard title={item.title} category={resolvedCategory} />

          <Text style={styles.sectionTitle}>금액</Text>
          <CustomTextInput
            label="수정할 금액을 입력해주세요"
            value={amountInput}
            onChangeText={handleChangeAmountInput}
            keyboardType="number-pad"
            containerStyle={styles.amountInput}
          />
          <Text style={styles.amountPreview}>{amountPreviewLabel}원</Text>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>납부일</Text>
      <FixedExpensePaymentDayStepper
        paymentDay={paymentDay}
        onDecrease={decreasePaymentDay}
        onIncrease={increasePaymentDay}
      />

      <TouchableOpacity activeOpacity={0.88} style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
