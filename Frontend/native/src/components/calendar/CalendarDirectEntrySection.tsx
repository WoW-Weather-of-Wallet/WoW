import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarEntryCategoryKey } from '../../constants/calendar/addEntry';
import { COLORS, wp } from '../../constants/theme';
import type {
  ManualCalendarEntryDraft,
  ManualEntryPaymentMethod,
} from '../../types/calendar';
import { styles } from './calendarAddEntryUi';
import CalendarCategorySelector from './CalendarCategorySelector';
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
  onSelectCategory: (value: CalendarEntryCategoryKey | null) => void;
  onSelectPaymentMethod: (value: ManualEntryPaymentMethod | null) => void;
  onChangeMerchantName: (value: string) => void;
  onChangeAmountInput: (value: string) => void;
  onAddDraftEntry: () => void;
  onRemoveDraftEntry: (id: string) => void;
  onComplete: () => void;
}

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
  onSelectCategory,
  onSelectPaymentMethod,
  onChangeMerchantName,
  onChangeAmountInput,
  onAddDraftEntry,
  onRemoveDraftEntry,
  onComplete,
}: CalendarDirectEntrySectionProps) {
  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.directContent}
    >
      <CalendarFieldLabel icon="calendar-outline" label="날짜" />
      <View style={styles.inputShell}>
        <TextInput
          value={dateKey}
          onChangeText={onChangeDateKey}
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textTertiary}
        />
        <Ionicons name="calendar-outline" size={wp(20)} color={COLORS.textSecondary} />
      </View>

      {draftEntries.length > 0 ? (
        <View style={styles.draftList}>
          {draftEntries.map((draft) => (
            <CalendarDraftEntryCard
              key={draft.id}
              draft={draft}
              onRemove={onRemoveDraftEntry}
            />
          ))}
        </View>
      ) : null}

      <CalendarFieldLabel label="카테고리" />
      <CalendarCategorySelector
        variant="chip"
        selectedCategory={selectedCategory}
        onSelect={onSelectCategory}
      />

      <CalendarFieldLabel label="결제수단" />
      <CalendarPaymentMethodSelector
        selectedPaymentMethod={selectedPaymentMethod}
        onSelect={onSelectPaymentMethod}
      />

      <View style={styles.inputShell}>
        <TextInput
          value={merchantName}
          onChangeText={onChangeMerchantName}
          style={styles.input}
          placeholder="가맹점명을 입력해주세요"
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      <View style={styles.inputShell}>
        <TextInput
          value={amountInput}
          onChangeText={(value) => onChangeAmountInput(value.replace(/[^0-9]/g, ''))}
          style={styles.input}
          placeholder="금액 (원)"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="number-pad"
        />
      </View>

      {confirmErrorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={wp(16)} color={COLORS.spentRed} />
          <Text style={styles.errorText}>{confirmErrorMessage}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.primaryButton, !isAddEnabled && styles.primaryButtonDisabled]}
        disabled={!isAddEnabled}
        onPress={onAddDraftEntry}
      >
        <Text style={styles.primaryButtonText}>+ 내역 초안 추가</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.secondaryButton,
          (draftEntries.length === 0 || isConfirmLoading) && styles.secondaryButtonDisabled,
        ]}
        disabled={draftEntries.length === 0 || isConfirmLoading}
        onPress={onComplete}
      >
        <Text
          style={[
            styles.secondaryButtonText,
            (draftEntries.length === 0 || isConfirmLoading) && styles.secondaryButtonTextDisabled,
          ]}
        >
          {isConfirmLoading ? '저장 중...' : '저장한 내역 완료'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
