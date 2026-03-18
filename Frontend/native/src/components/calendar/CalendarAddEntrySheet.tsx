import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import BottomSheetModal from '../common/BottomSheetModal';
import {
  CALENDAR_ENTRY_CATEGORIES,
  CALENDAR_EXCEL_BANKS,
  type CalendarEntryCategoryKey,
} from '../../constants/calendar/addEntry';
import {
  isCsvFile,
  isSpreadsheetFile,
  parseCsvToUploadGroups,
  parseSpreadsheetToUploadGroups,
} from '../../constants/calendar/excel';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useCalendarAddEntryForm } from '../../hooks/useCalendarAddEntryForm';
import type {
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
  ManualCalendarEntryDraft,
} from '../../types/calendar';

interface CalendarAddEntrySheetProps {
  visible: boolean;
  defaultDateKey: string;
  onClose: () => void;
  onCompleteManualEntries: (entries: ManualCalendarEntryDraft[]) => void;
  onCompleteExcelEntries: (entries: ManualCalendarEntryDraft[]) => void;
}

type EntryMode = 'direct' | 'excel';
type UploadItemStatus = 'classified' | 'needs-category';

type MockUploadTransaction = {
  id: string;
  merchantName: string;
  amount: number;
  categoryLabel: CalendarEntryCategoryKey | '분류필요';
  status: UploadItemStatus;
  description?: string;
};

type MockUploadGroup = {
  dateKey: string;
  totalCount: number;
  items: MockUploadTransaction[];
};

const ENTRY_MODES: Array<{
  key: EntryMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'direct', label: '직접 입력', icon: 'create-outline' },
  { key: 'excel', label: '엑셀 업로드', icon: 'folder-open-outline' },
];

const INITIAL_UPLOAD_GROUPS: MockUploadGroup[] = [];

export default function CalendarAddEntrySheet({
  visible,
  defaultDateKey,
  onClose,
  onCompleteManualEntries,
  onCompleteExcelEntries,
}: CalendarAddEntrySheetProps) {
  const {
    activeMode,
    dateKey,
    selectedCategory,
    merchantName,
    amountInput,
    draftEntries,
    selectedExcelFile,
    isAddEnabled,
    setActiveMode,
    setDateKey,
    setSelectedCategory,
    setMerchantName,
    setAmountInput,
    setSelectedExcelFile,
    addDraftEntry,
    removeDraftEntry,
  } = useCalendarAddEntryForm({
    defaultDateKey,
    visible,
  });

  const [uploadGroups, setUploadGroups] = useState<MockUploadGroup[]>(INITIAL_UPLOAD_GROUPS);
  const [selectedUploadItemId, setSelectedUploadItemId] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setUploadGroups(INITIAL_UPLOAD_GROUPS);
    setSelectedUploadItemId(null);
    setUploadErrorMessage(null);
  }, [visible]);

  const selectedUploadItem = useMemo(() => {
    if (!selectedUploadItemId) {
      return null;
    }

    for (const group of uploadGroups) {
      const target = group.items.find((item) => item.id === selectedUploadItemId);
      if (target) {
        return target;
      }
    }

    return null;
  }, [selectedUploadItemId, uploadGroups]);

  const handleComplete = () => {
    if (draftEntries.length === 0) {
      return;
    }

    onCompleteManualEntries(draftEntries);
  };

  const handlePickExcelFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'text/comma-separated-values',
      ],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const nextFile: CalendarUploadFile = {
      name: asset.name,
      uri: asset.uri,
      mimeType: asset.mimeType,
      size: asset.size,
    };

    setSelectedExcelFile(nextFile);
    setSelectedUploadItemId(null);

    try {
      let nextGroups: CalendarUploadPreviewGroup[] = [];

      if (isCsvFile(nextFile.name, nextFile.mimeType)) {
        const csvText = await FileSystem.readAsStringAsync(nextFile.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        nextGroups = parseCsvToUploadGroups(csvText);
      } else if (isSpreadsheetFile(nextFile.name)) {
        const base64 = await FileSystem.readAsStringAsync(nextFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        nextGroups = parseSpreadsheetToUploadGroups(base64);
      } else {
        setUploadGroups([]);
        setUploadErrorMessage('현재는 csv, xls, xlsx 파일만 지원해요.');
        return;
      }

      setUploadGroups(nextGroups);
      setUploadErrorMessage(
        nextGroups.length === 0 ? '파일은 읽었지만 거래내역 형식을 찾지 못했어요.' : null,
      );
    } catch (error) {
      console.warn('Failed to parse upload file', error);
      setUploadGroups([]);
      setUploadErrorMessage('파일을 읽는 중 문제가 생겼어요. 다른 파일로 다시 시도해주세요.');
    }
  };

  const handleSelectUploadCategory = (categoryLabel: CalendarEntryCategoryKey) => {
    if (!selectedUploadItemId) {
      return;
    }

    setUploadGroups((current) =>
      current.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === selectedUploadItemId
            ? { ...item, categoryLabel, status: 'classified' }
            : item,
        ),
      })),
    );
    setSelectedUploadItemId(null);
  };

  const uploadPreviewGroups = selectedExcelFile ? uploadGroups : [];
  const hasPendingCategories = uploadPreviewGroups.some((group) =>
    group.items.some((item) => item.status === 'needs-category'),
  );

  const handleCompleteExcelUpload = () => {
    if (!selectedExcelFile || hasPendingCategories) {
      return;
    }

    const nextEntries: ManualCalendarEntryDraft[] = uploadPreviewGroups.flatMap((group) =>
      group.items.map((item, index) => ({
        id: `excel-${group.dateKey}-${index}`,
        dateKey: group.dateKey,
        merchantName: item.merchantName,
        category: item.categoryLabel as CalendarEntryCategoryKey,
        amount: item.amount,
      })),
    );

    onCompleteExcelEntries(nextEntries);
  };

  return (
    <>
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
                          onPress={() => removeDraftEntry(draft.id)}
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
                      <Text
                        style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                      >
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
                onPress={addDraftEntry}
              >
                <Text style={styles.primaryButtonText}>+ 추가</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.secondaryButton,
                  draftEntries.length === 0 && styles.secondaryButtonDisabled,
                ]}
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
                    은행 앱에서 내보낸 `.xlsx` 또는 `.csv` 파일을 선택하면 거래내역을 불러올
                    준비를 할 수 있어요.
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

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.uploadBox}
                onPress={handlePickExcelFile}
              >
                <Ionicons name="folder-open" size={wp(40)} color="#E2C35A" />
                <Text style={styles.uploadTitle}>
                  {selectedExcelFile ? selectedExcelFile.name : '파일 선택 또는 드래그'}
                </Text>
                <Text style={styles.uploadHint}>
                  {selectedExcelFile
                    ? buildFileSummary(selectedExcelFile)
                    : '.xlsx, .csv, .xls 지원'}
                </Text>
              </TouchableOpacity>

              <View style={styles.noticeBox}>
                <Ionicons name="bulb-outline" size={wp(14)} color="#D2A645" />
                <Text style={styles.noticeText}>
                  이미 같은 날짜 내역이 있으면 중복 추가되지 않아요.
                </Text>
              </View>

              {selectedExcelFile ? (
                <View style={styles.fileInfoCard}>
                  <View style={styles.fileInfoHeader}>
                    <Ionicons name="checkmark-circle" size={wp(18)} color="#66B677" />
                    <Text style={styles.fileInfoTitle}>파일 선택 완료</Text>
                  </View>
                  <Text style={styles.fileInfoName}>{selectedExcelFile.name}</Text>
                  <Text style={styles.fileInfoMeta}>{buildFileSummary(selectedExcelFile)}</Text>
                </View>
              ) : null}

              {uploadErrorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={wp(16)} color="#D87272" />
                  <Text style={styles.errorText}>{uploadErrorMessage}</Text>
                </View>
              ) : null}

              {uploadPreviewGroups.map((group) => {
                const needsCategoryCount = group.items.filter(
                  (item) => item.status === 'needs-category',
                ).length;

                return (
                  <View key={group.dateKey} style={styles.uploadResultSection}>
                    <View style={styles.uploadResultHeader}>
                      <Text style={styles.uploadResultDate}>{group.dateKey}</Text>
                      <Text style={styles.uploadResultSummary}>
                        {group.totalCount}건 ·
                        <Text style={styles.uploadResultNeedsCategory}>
                          {' '}
                          {needsCategoryCount}건 분류필요
                        </Text>
                      </Text>
                    </View>

                    <View style={styles.uploadResultList}>
                      {group.items.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.88}
                          style={[
                            styles.uploadResultItem,
                            index < group.items.length - 1 && styles.uploadResultDivider,
                          ]}
                          onPress={() => setSelectedUploadItemId(item.id)}
                        >
                          <View style={styles.uploadResultLeft}>
                            <View style={styles.uploadResultIcon}>
                              <Ionicons
                                name="document-text-outline"
                                size={wp(16)}
                                color={COLORS.textTertiary}
                              />
                            </View>
                            <View style={styles.uploadResultTextWrap}>
                              <Text style={styles.uploadResultMerchant}>{item.merchantName}</Text>
                              {item.description ? (
                                <Text style={styles.uploadResultDescription}>{item.description}</Text>
                              ) : null}
                            </View>
                          </View>

                          <View style={styles.uploadResultRight}>
                            <Text style={styles.uploadResultAmount}>
                              -₩{item.amount.toLocaleString()}
                            </Text>
                            <View
                              style={[
                                styles.uploadResultBadge,
                                item.status === 'needs-category'
                                  ? styles.uploadResultBadgeWarning
                                  : styles.uploadResultBadgeDefault,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.uploadResultBadgeText,
                                  item.status === 'needs-category'
                                    ? styles.uploadResultBadgeTextWarning
                                    : styles.uploadResultBadgeTextDefault,
                                ]}
                              >
                                {item.categoryLabel}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}

              {selectedExcelFile ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.primaryButton,
                    hasPendingCategories && styles.primaryButtonDisabled,
                  ]}
                  disabled={hasPendingCategories}
                  onPress={handleCompleteExcelUpload}
                >
                  <Text style={styles.primaryButtonText}>
                    {hasPendingCategories ? '분류를 먼저 완료해주세요' : '업로드 내역 반영'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          )}
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        visible={selectedUploadItem !== null}
        onClose={() => setSelectedUploadItemId(null)}
        title="카테고리를 선택해주세요"
        subtitle={
          selectedUploadItem
            ? `"${selectedUploadItem.merchantName}" · -₩${selectedUploadItem.amount.toLocaleString()}`
            : ''
        }
        scrollable={false}
      >
        <View style={styles.categorySelectWrap}>
          <View style={styles.recommendBadge}>
            <Ionicons name="sparkles-outline" size={wp(12)} color="#D5893E" />
            <Text style={styles.recommendBadgeText}>AI 추천: 기타</Text>
          </View>

          <View style={styles.categorySelectGrid}>
            {CALENDAR_ENTRY_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                activeOpacity={0.88}
                style={styles.categorySelectCard}
                onPress={() => handleSelectUploadCategory(category.key)}
              >
                <Ionicons name={category.icon} size={wp(22)} color={COLORS.primary} />
                <Text style={styles.categorySelectText}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomSheetModal>
    </>
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

function buildFileSummary(file: CalendarUploadFile) {
  if (!file.size) {
    return file.mimeType ?? '문서 선택 완료';
  }

  const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
  return `${fileSizeKb}KB${file.mimeType ? ` · ${file.mimeType}` : ''}`;
}

const styles = StyleSheet.create({
  container: {
    maxHeight: hp(620),
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
    paddingBottom: hp(12),
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
    textAlign: 'center',
  },
  uploadHint: {
    marginTop: hp(6),
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFF2F2',
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
  },
  errorText: {
    flex: 1,
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: '#D87272',
  },
  fileInfoCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#F7F5FF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(8),
  },
  fileInfoTitle: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: '#66B677',
  },
  fileInfoName: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  fileInfoMeta: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  uploadResultSection: {
    gap: hp(10),
  },
  uploadResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadResultDate: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  uploadResultSummary: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  uploadResultNeedsCategory: {
    color: '#D5893E',
  },
  uploadResultList: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#FBFAFF',
    overflow: 'hidden',
  },
  uploadResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(14),
    paddingVertical: hp(13),
  },
  uploadResultDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF9',
  },
  uploadResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    flex: 1,
  },
  uploadResultIcon: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: '#F1EEFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadResultMerchant: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  uploadResultTextWrap: {
    flex: 1,
    gap: hp(4),
  },
  uploadResultDescription: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  uploadResultRight: {
    alignItems: 'flex-end',
    gap: hp(6),
  },
  uploadResultAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: '#E17A7A',
  },
  uploadResultBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
  },
  uploadResultBadgeDefault: {
    backgroundColor: '#EAF6E4',
  },
  uploadResultBadgeWarning: {
    backgroundColor: '#FFF1DA',
  },
  uploadResultBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.bold,
  },
  uploadResultBadgeTextDefault: {
    color: '#7AA55A',
  },
  uploadResultBadgeTextWarning: {
    color: '#D5893E',
  },
  categorySelectWrap: {
    paddingBottom: hp(4),
  },
  recommendBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: '#FFF1DA',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
    marginBottom: hp(14),
  },
  recommendBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: '#D5893E',
  },
  categorySelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(12),
  },
  categorySelectCard: {
    width: '30%',
    minHeight: hp(110),
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#DDD9F2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(10),
  },
  categorySelectText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
});
