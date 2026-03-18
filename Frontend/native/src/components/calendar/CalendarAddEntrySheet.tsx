import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import {
  CALENDAR_ENTRY_CATEGORIES,
  CALENDAR_EXCEL_BANKS,
  type CalendarEntryCategoryKey,
} from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export type ManualCalendarEntryDraft = {
  id: string;
  dateKey: string;
  merchantName: string;
  category: CalendarEntryCategoryKey;
  amount: number;
};

interface CalendarAddEntrySheetProps {
  visible: boolean;
  defaultDateKey: string;
  onClose: () => void;
  onCompleteManualEntries: (entries: ManualCalendarEntryDraft[]) => void;
}

type EntryMode = 'direct' | 'excel';

const ENTRY_MODES: Array<{
  key: EntryMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'direct', label: '직접 입력', icon: 'create-outline' },
  { key: 'excel', label: '엑셀 업로드', icon: 'folder-open-outline' },
];

export default function CalendarAddEntrySheet({
  visible,
  defaultDateKey,
  onClose,
  onCompleteManualEntries,
}: CalendarAddEntrySheetProps) {
  const [activeMode, setActiveMode] = useState<EntryMode>('direct');
  const [dateKey, setDateKey] = useState(defaultDateKey);
  const [selectedCategory, setSelectedCategory] = useState<CalendarEntryCategoryKey>('식비');
  const [merchantName, setMerchantName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [draftEntries, setDraftEntries] = useState<ManualCalendarEntryDraft[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveMode('direct');
    setDateKey(defaultDateKey);
    setSelectedCategory('식비');
    setMerchantName('');
    setAmountInput('');
    setDraftEntries([]);
  }, [defaultDateKey, visible]);

  const isAddEnabled = useMemo(() => {
    return dateKey.trim().length > 0 && merchantName.trim().length > 0 && Number(amountInput) > 0;
  }, [amountInput, dateKey, merchantName]);

  const handleAddDraft = () => {
    if (!isAddEnabled) {
      return;
    }

    setDraftEntries((current) => [
      ...current,
      {
        id: `draft-${Date.now()}-${current.length}`,
        dateKey,
        merchantName: merchantName.trim(),
        category: selectedCategory,
        amount: Number(amountInput),
      },
    ]);
    setMerchantName('');
    setAmountInput('');
  };

  const handleRemoveDraft = (draftId: string) => {
    setDraftEntries((current) => current.filter((draft) => draft.id !== draftId));
  };

  const handleComplete = () => {
    if (draftEntries.length === 0) {
      return;
    }

    onCompleteManualEntries(draftEntries);
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      scrollable={false}
      showCloseButton={false}
      subtitle=""
    >
      <View style={styles.container}>
        <View style={styles.modeRow}>
          {ENTRY_MODES.map((mode) => {
            const isActive = activeMode === mode.key;

            return (
              <TouchableOpacity
                key={mode.key}
                activeOpacity={0.88}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}
                onPress={() => setActiveMode(mode.key)}
              >
                <Ionicons
                  name={mode.icon}
                  size={wp(16)}
                  color={isActive ? COLORS.primary : COLORS.textTertiary}
                />
                <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeMode === 'direct' ? (
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.directContent}
          >
            <FieldLabel icon="calendar-outline" label="날짜" />
            <View style={styles.inputShell}>
              <TextInput
                value={dateKey}
                onChangeText={setDateKey}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textTertiary}
              />
              <Ionicons name="calendar-outline" size={wp(20)} color={COLORS.textSecondary} />
            </View>

            {draftEntries.length > 0 ? (
              <View style={styles.draftList}>
                {draftEntries.map((draft) => (
                  <View key={draft.id} style={styles.draftCard}>
                    <View style={styles.draftHeaderRow}>
                      <Text style={styles.draftDateText}>{formatDateLabel(draft.dateKey)}</Text>
                      <Text style={styles.draftAmountText}>-₩{draft.amount.toLocaleString()}</Text>
                    </View>

                    <View style={styles.draftBodyRow}>
                      <View style={styles.draftMetaWrap}>
                        <Text style={styles.draftMerchantText}>{draft.merchantName}</Text>
                        <View style={styles.draftBadge}>
                          <Text style={styles.draftBadgeText}>{draft.category}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleRemoveDraft(draft.id)}
                      >
                        <Ionicons name="close" size={wp(16)} color={COLORS.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <FieldLabel label="카테고리" />
            <View style={styles.categoryGrid}>
              {CALENDAR_ENTRY_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.key;

                return (
                  <TouchableOpacity
                    key={category.key}
                    activeOpacity={0.88}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(category.key)}
                  >
                    <Ionicons
                      name={category.icon}
                      size={wp(14)}
                      color={isActive ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputShell}>
              <TextInput
                value={merchantName}
                onChangeText={setMerchantName}
                style={styles.input}
                placeholder="가맹점명 (예: 스타벅스)"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.inputShell}>
              <TextInput
                value={amountInput}
                onChangeText={(value) => setAmountInput(value.replace(/[^0-9]/g, ''))}
                style={styles.input}
                placeholder="금액 (원)"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.primaryButton, !isAddEnabled && styles.primaryButtonDisabled]}
              disabled={!isAddEnabled}
              onPress={handleAddDraft}
            >
              <Text style={styles.primaryButtonText}>+ 추가</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.secondaryButton, draftEntries.length === 0 && styles.secondaryButtonDisabled]}
              disabled={draftEntries.length === 0}
              onPress={handleComplete}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  draftEntries.length === 0 && styles.secondaryButtonTextDisabled,
                ]}
              >
                완료
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.excelContent}
          >
            <View style={styles.excelInfoCard}>
              <View style={styles.excelIconWrap}>
                <Ionicons name="document-text-outline" size={wp(24)} color="#B08A5B" />
              </View>
              <View style={styles.excelTextWrap}>
                <Text style={styles.excelTitle}>엑셀 파일 업로드</Text>
                <Text style={styles.excelDescription}>
                  은행 앱에서 내보낸 .xlsx / .csv 파일을 선택하면 오늘 날짜 거래내역만 자동으로 가져와요.
                </Text>
              </View>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>지원 형식</Text>
              <View style={styles.bankChipWrap}>
                {CALENDAR_EXCEL_BANKS.map((bank) => (
                  <View key={bank} style={styles.bankChip}>
                    <Text style={styles.bankChipText}>{bank}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.uploadBox}>
              <Ionicons name="folder-open" size={wp(40)} color="#E2C35A" />
              <Text style={styles.uploadTitle}>파일 선택 또는 드래그</Text>
              <Text style={styles.uploadHint}>.xlsx, .csv, .xls 지원</Text>
            </View>

            <View style={styles.noticeBox}>
              <Ionicons name="bulb-outline" size={wp(14)} color="#D2A645" />
              <Text style={styles.noticeText}>이미 같은 날짜 내역이 있으면 중복 추가되지 않아요.</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </BottomSheetModal>
  );
}

function FieldLabel({
  label,
  icon,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fieldLabelRow}>
      {icon ? <Ionicons name={icon} size={wp(14)} color={COLORS.primary} /> : null}
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
  );
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

const styles = StyleSheet.create({
  container: {
    maxHeight: hp(560),
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F6F5FB',
    borderRadius: RADIUS.xl,
    padding: wp(4),
    marginBottom: hp(18),
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    paddingVertical: hp(12),
    borderRadius: RADIUS.lg,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2E245A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  modeText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  modeTextActive: {
    color: COLORS.primary,
  },
  directContent: {
    gap: hp(14),
    paddingBottom: hp(6),
  },
  excelContent: {
    gap: hp(16),
    paddingBottom: hp(6),
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
  },
  fieldLabel: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  inputShell: {
    minHeight: hp(54),
    borderWidth: 1.5,
    borderColor: '#E3E1F0',
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    paddingVertical: hp(14),
  },
  draftList: {
    gap: hp(10),
  },
  draftCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: '#F7F5FF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
  },
  draftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(10),
  },
  draftDateText: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  draftAmountText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: '#E17A7A',
  },
  draftBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    flex: 1,
  },
  draftMerchantText: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  draftBadge: {
    backgroundColor: '#E3DCFF',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
  },
  draftBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  categoryChip: {
    minWidth: wp(78),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderWidth: 1,
    borderColor: '#DDD9F2',
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(52),
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E6E2F3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(52),
  },
  secondaryButtonDisabled: {
    backgroundColor: '#FAFAFC',
  },
  secondaryButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  secondaryButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  excelInfoCard: {
    flexDirection: 'row',
    gap: wp(14),
    backgroundColor: '#F7F5FF',
    borderRadius: RADIUS.xl,
    padding: wp(16),
  },
  excelIconWrap: {
    width: wp(36),
    alignItems: 'center',
    paddingTop: hp(2),
  },
  excelTextWrap: {
    flex: 1,
  },
  excelTitle: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  excelDescription: {
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  bankRow: {
    gap: hp(10),
  },
  bankLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  bankChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
  },
  bankChip: {
    borderRadius: RADIUS.full,
    backgroundColor: '#ECE8FF',
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
  },
  bankChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C9C1FF',
    borderRadius: RADIUS.xl,
    backgroundColor: '#FCFBFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(34),
  },
  uploadTitle: {
    marginTop: hp(14),
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  uploadHint: {
    marginTop: hp(6),
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFF8E8',
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
  },
  noticeText: {
    flex: 1,
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: '#8C6A2D',
  },
});
