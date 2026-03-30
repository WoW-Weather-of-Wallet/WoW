import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarEntryCategoryKey } from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type {
  ManualCalendarEntryDraft,
  ManualEntryPaymentMethod,
} from '../../types/calendar';
import CalendarDraftEntryCard from './CalendarDraftEntryCard';
import CalendarFieldLabel from './CalendarFieldLabel';
import CalendarPaymentMethodSelector from './CalendarPaymentMethodSelector';

interface CalendarDirectEntrySectionProps {
  dateKey: string;
  selectedCategory: CalendarEntryCategoryKey | null;
  selectedPaymentMethod: ManualEntryPaymentMethod | null;
  merchantName: string;
  amountInput: string;
  draftEntries: ManualCalendarEntryDraft[];
  confirmErrorMessage: string | null;
  isAddEnabled: boolean;
  isConfirmLoading: boolean;
  onChangeDateKey: (value: string) => void;
  onOpenDatePicker: () => void;
  onOpenCategorySheet: () => void;
  onSelectPaymentMethod: (value: ManualEntryPaymentMethod | null) => void;
  onChangeMerchantName: (value: string) => void;
  onChangeAmountInput: (value: string) => void;
  onAddDraftEntry: () => void;
  onRemoveDraftEntry: (id: string) => void;
  onComplete: () => void;
}

const inputShellStyle = {
  minHeight: hp(54),
  borderWidth: 1.5,
  borderColor: COLORS.inputBorder,
  borderRadius: RADIUS.lg,
  backgroundColor: COLORS.white,
  paddingHorizontal: wp(16),
};

const inputTextStyle = {
  flex: 1,
  fontSize: fp(16),
  fontFamily: FONTS.medium,
  color: COLORS.textPrimary,
  paddingVertical: hp(14),
};

const errorBoxStyle = {
  gap: wp(8),
  borderRadius: RADIUS.lg,
  backgroundColor: COLORS.errorBackground,
  paddingHorizontal: wp(14),
  paddingVertical: hp(12),
};

export default function CalendarDirectEntrySection({
  dateKey,
  selectedCategory,
  selectedPaymentMethod,
  merchantName,
  amountInput,
  draftEntries,
  confirmErrorMessage,
  isAddEnabled,
  isConfirmLoading,
  onChangeDateKey,
  onOpenDatePicker,
  onOpenCategorySheet,
  onSelectPaymentMethod,
  onChangeMerchantName,
  onChangeAmountInput,
  onAddDraftEntry,
  onRemoveDraftEntry,
  onComplete,
}: CalendarDirectEntrySectionProps) {
  const isCompleteDisabled = draftEntries.length === 0 || isConfirmLoading;
  const selectedCategoryLabel = selectedCategory ?? '카테고리를 선택해주세요';
  const isCategorySelected = selectedCategory !== null;

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: hp(14), paddingBottom: hp(20) }}
      >
        <CalendarFieldLabel icon="calendar-outline" label="날짜" />
        <View
          className="flex-row items-center justify-between"
          style={inputShellStyle}
        >
          <TextInput
            value={dateKey}
            onChangeText={onChangeDateKey}
            style={inputTextStyle}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textTertiary}
          />
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              width: wp(28),
              height: wp(28),
              borderRadius: wp(14),
            }}
            onPress={onOpenDatePicker}
          >
            <Ionicons name="calendar-outline" size={wp(20)} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {draftEntries.length > 0 ? (
          <View style={{ gap: hp(10) }}>
            {draftEntries.map((draft) => (
              <CalendarDraftEntryCard key={draft.id} draft={draft} onRemove={onRemoveDraftEntry} />
            ))}
          </View>
        ) : null}

        <CalendarFieldLabel label="카테고리" />
        <TouchableOpacity
          activeOpacity={0.86}
          className="flex-row items-center justify-between"
          style={inputShellStyle}
          onPress={onOpenCategorySheet}
        >
          <Text
            style={{
              flex: 1,
              fontSize: fp(16),
              fontFamily: isCategorySelected ? FONTS.semiBold : FONTS.medium,
              color: isCategorySelected ? COLORS.textPrimary : COLORS.textTertiary,
            }}
          >
            {selectedCategoryLabel}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={wp(20)}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <CalendarFieldLabel label="결제수단" />
        <CalendarPaymentMethodSelector
          selectedPaymentMethod={selectedPaymentMethod}
          onSelect={onSelectPaymentMethod}
        />

        <View style={inputShellStyle}>
          <TextInput
            value={merchantName}
            onChangeText={onChangeMerchantName}
            style={inputTextStyle}
            placeholder="가맹점명을 입력해주세요"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        <View style={inputShellStyle}>
          <TextInput
            value={amountInput}
            onChangeText={(value) => onChangeAmountInput(value.replace(/[^0-9]/g, ''))}
            style={inputTextStyle}
            placeholder="금액 (원)"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="number-pad"
          />
        </View>

        {confirmErrorMessage ? (
          <View className="flex-row items-center" style={errorBoxStyle}>
            <Ionicons name="cloud-offline-outline" size={wp(16)} color={COLORS.spentRed} />
            <Text
              style={{
                flex: 1,
                fontSize: fp(13),
                lineHeight: fp(19),
                fontFamily: FONTS.medium,
                color: COLORS.spentRed,
              }}
            >
              {confirmErrorMessage}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          gap: hp(12),
          paddingTop: hp(12),
          borderTopWidth: 1,
          borderTopColor: COLORS.gray100,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          className="items-center justify-center"
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: RADIUS.lg,
            minHeight: hp(52),
            opacity: isAddEnabled ? 1 : 0.45,
          }}
          disabled={!isAddEnabled}
          onPress={onAddDraftEntry}
        >
          <Text
            style={{
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.white,
            }}
          >
            내역 추가
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          className="items-center justify-center"
          style={{
            borderRadius: RADIUS.lg,
            borderWidth: 1.5,
            borderColor: COLORS.secondaryButtonBorder,
            backgroundColor: isCompleteDisabled ? COLORS.secondaryButtonDisabled : COLORS.white,
            minHeight: hp(52),
          }}
          disabled={isCompleteDisabled}
          onPress={onComplete}
        >
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: isCompleteDisabled ? COLORS.textTertiary : COLORS.textSecondary,
            }}
          >
            {isConfirmLoading ? '저장 중...' : '입력 완료'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
