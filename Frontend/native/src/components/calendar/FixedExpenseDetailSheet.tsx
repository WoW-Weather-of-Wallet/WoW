import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import CustomTextInput from '../common/CustomTextInput';
import { useFixedExpenseDetailForm, type FixedExpenseDetailItem } from '../../hooks';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import FixedExpensePaymentDayStepper from './FixedExpensePaymentDayStepper';
import FixedExpenseReadonlyInfoCard from './FixedExpenseReadonlyInfoCard';
import FixedExpenseSelectedSummaryCard from './FixedExpenseSelectedSummaryCard';

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
  submitLabel = '\uACE0\uC815\uC9C0\uCD9C\uB85C \uB4F1\uB85D\uD558\uAE30',
  onClose,
  onSubmit,
}: FixedExpenseDetailSheetProps) {
  const screenHeight = Dimensions.get('window').height;
  const sheetBodyHeight = Math.min(500, screenHeight * 0.62);
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
      scrollable={false}
    >
      <View style={{ height: sheetBodyHeight, minHeight: 320 }}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: hp(18), paddingBottom: hp(16) }}
        >
          <FixedExpenseSelectedSummaryCard item={item} />

          <View
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.aiHintBackground,
              paddingHorizontal: wp(14),
              paddingVertical: hp(12),
            }}
          >
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.aiHintTitle,
              }}
            >
              {aiHintTitle}
            </Text>
            <Text
              style={{
                marginTop: hp(6),
                fontSize: fp(12),
                fontFamily: FONTS.medium,
                color: COLORS.aiHintText,
                lineHeight: fp(18),
              }}
            >
              {aiHintText}
            </Text>
          </View>

          {isEditMode ? (
            <>
              <FixedExpenseReadonlyInfoCard
                title={item.title}
                category={resolvedCategory}
              />

              <View>
                <Text
                  style={{
                    fontSize: fp(16),
                    fontFamily: FONTS.bold,
                    color: COLORS.textPrimary,
                    marginBottom: hp(12),
                  }}
                >
                  {'\uAE08\uC561'}
                </Text>
                <CustomTextInput
                  label={'\uC218\uC815\uD560 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694'}
                  value={amountInput}
                  onChangeText={handleChangeAmountInput}
                  keyboardType="number-pad"
                  containerStyle={{ marginBottom: hp(8) }}
                />
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: fp(13),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.textSecondary,
                  }}
                >
                  {`${amountPreviewLabel}\uC6D0`}
                </Text>
              </View>
            </>
          ) : null}

          <View>
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(12),
              }}
            >
              {'\uB0A9\uBD80\uC77C'}
            </Text>
            <FixedExpensePaymentDayStepper
              paymentDay={paymentDay}
              onDecrease={decreasePaymentDay}
              onIncrease={increasePaymentDay}
            />
          </View>
        </ScrollView>

        <View
          style={{
            paddingTop: hp(12),
            borderTopWidth: 1,
            borderTopColor: COLORS.gray100,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.88}
            className="items-center justify-center"
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.primary,
              paddingVertical: hp(16),
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.bold,
                color: COLORS.textInverse,
              }}
            >
              {submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
