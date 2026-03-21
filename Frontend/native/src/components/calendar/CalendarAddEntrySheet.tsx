import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
import { COLORS, wp } from '../../constants/theme';
import { useCalendarAddEntryForm } from '../../hooks/useCalendarAddEntryForm';
import {
  getCalendarApiErrorMessage,
  uploadCalendarTransactions,
} from '../../services/calendar';
import type {
  CalendarUploadBackendItem,
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
  ManualCalendarEntryDraft,
} from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';

interface CalendarAddEntrySheetProps {
  visible: boolean;
  defaultDateKey: string;
  onClose: () => void;
  onCompleteManualEntries: (entries: ManualCalendarEntryDraft[]) => Promise<void> | void;
  onCompleteExcelEntries: (entries: ManualCalendarEntryDraft[]) => Promise<void> | void;
}

type EntryMode = 'direct' | 'excel';

const ENTRY_MODES: Array<{
  key: EntryMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'direct', label: '직접 입력', icon: 'create-outline' },
  { key: 'excel', label: '파일 업로드', icon: 'folder-open-outline' },
];

const INITIAL_UPLOAD_GROUPS: CalendarUploadPreviewGroup[] = [];

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

  const [uploadGroups, setUploadGroups] = useState<CalendarUploadPreviewGroup[]>(INITIAL_UPLOAD_GROUPS);
  const [selectedUploadItemId, setSelectedUploadItemId] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [backendSummary, setBackendSummary] = useState<CalendarUploadBackendSummary | null>(null);
  const [backendSummaryError, setBackendSummaryError] = useState<string | null>(null);
  const [isBackendSummaryLoading, setIsBackendSummaryLoading] = useState(false);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState<string | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setUploadGroups(INITIAL_UPLOAD_GROUPS);
    setSelectedUploadItemId(null);
    setUploadErrorMessage(null);
    setBackendSummary(null);
    setBackendSummaryError(null);
    setIsBackendSummaryLoading(false);
    setConfirmErrorMessage(null);
    setIsConfirmLoading(false);
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

  const hasPendingCategories = uploadGroups.some((group) =>
    group.items.some((item) => item.status === 'needs-category'),
  );
  const hasUploadEntries = uploadGroups.length > 0;

  const handleCompleteManualEntries = async () => {
    if (draftEntries.length === 0 || isConfirmLoading) {
      return;
    }

    setConfirmErrorMessage(null);
    setIsConfirmLoading(true);

    try {
      await Promise.resolve(onCompleteManualEntries(draftEntries));
    } catch (error) {
      console.warn('Failed to confirm manual calendar entries', error);
      setConfirmErrorMessage(
        getCalendarApiErrorMessage(error, '소비 내역을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsConfirmLoading(false);
    }
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
    setUploadGroups(INITIAL_UPLOAD_GROUPS);
    setUploadErrorMessage(null);
    setBackendSummary(null);
    setBackendSummaryError(null);
    setConfirmErrorMessage(null);
    setIsBackendSummaryLoading(true);

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
        setUploadErrorMessage('csv, xls, xlsx 파일만 업로드할 수 있어요.');
        return;
      }

      setUploadGroups(nextGroups);

      if (nextGroups.length === 0) {
        setUploadErrorMessage('파일에서 읽을 수 있는 소비 내역을 찾지 못했어요.');
      }
    } catch (error) {
      console.warn('Failed to parse upload file locally', error);
      setUploadGroups([]);
      setUploadErrorMessage('파일 내용을 읽지 못했어요. 다른 형식의 파일인지 확인해주세요.');
    }

    try {
      // Native currently selects one file at a time, so we infer whether it is
      // a bank or card export from the filename before calling the backend.
      const summary = await uploadCalendarTransactions(buildUploadRequest(nextFile));
      setBackendSummary(summary);

      // Prefer the backend item-level classification result when it is available.
      // This keeps the visible upload list aligned with Flask auto-classification.
      if (summary.items.length > 0) {
        setUploadGroups(buildUploadGroupsFromBackendItems(summary.items));
        setUploadErrorMessage(null);
      }
    } catch (error) {
      console.warn('Failed to upload calendar file to backend', error);
      setBackendSummaryError(
        getCalendarApiErrorMessage(error, '업로드한 파일을 분석하지 못했어요. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsBackendSummaryLoading(false);
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
            ? { ...item, categoryLabel, categoryId: undefined, status: 'classified' }
            : item,
        ),
      })),
    );
    setSelectedUploadItemId(null);
  };

  const handleCompleteExcelUpload = async () => {
    if (!selectedExcelFile || hasPendingCategories || !hasUploadEntries || isConfirmLoading) {
      return;
    }

    const nextEntries: ManualCalendarEntryDraft[] = uploadGroups.flatMap((group) =>
      group.items.map((item, index) => ({
        id: `excel-${group.dateKey}-${index}`,
        dateKey: group.dateKey,
        merchantName: item.merchantName,
        category: item.categoryLabel,
        amount: item.amount,
        categoryId: item.categoryId,
      })),
    );

    setConfirmErrorMessage(null);
    setIsConfirmLoading(true);

    try {
      await Promise.resolve(onCompleteExcelEntries(nextEntries));
    } catch (error) {
      console.warn('Failed to confirm uploaded calendar entries', error);
      setConfirmErrorMessage(
        getCalendarApiErrorMessage(error, '업로드한 소비 내역을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsConfirmLoading(false);
    }
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
                        <Text style={styles.draftAmountText}>-{draft.amount.toLocaleString()}원</Text>
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
                        color={isActive ? COLORS.white : COLORS.textSecondary}
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
                  placeholder="가맹점 이름을 입력해주세요"
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
                onPress={addDraftEntry}
              >
                <Text style={styles.primaryButtonText}>+ 내역 추가</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.secondaryButton,
                  (draftEntries.length === 0 || isConfirmLoading) && styles.secondaryButtonDisabled,
                ]}
                disabled={draftEntries.length === 0 || isConfirmLoading}
                onPress={handleCompleteManualEntries}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    (draftEntries.length === 0 || isConfirmLoading) && styles.secondaryButtonTextDisabled,
                  ]}
                >
                  {isConfirmLoading ? '저장 중...' : '캘린더에 저장'}
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
                  <Ionicons name="document-text-outline" size={wp(24)} color={COLORS.excelIconGold} />
                </View>
                <View style={styles.excelTextWrap}>
                  <Text style={styles.excelTitle}>엑셀 파일 업로드</Text>
                  <Text style={styles.excelDescription}>
                    은행 또는 카드 내역 CSV, 엑셀 파일을 올리면 미리보기와 백엔드 분류 결과를 함께 확인할 수 있어요.
                  </Text>
                </View>
              </View>

              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>지원 포맷</Text>
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
                  {selectedExcelFile ? selectedExcelFile.name : '업로드할 파일을 선택해주세요'}
                </Text>
                <Text style={styles.uploadHint}>
                  {selectedExcelFile ? buildFileSummary(selectedExcelFile) : '.xlsx, .csv, .xls 지원'}
                </Text>
              </TouchableOpacity>

              <View style={styles.noticeBox}>
                <Ionicons name="bulb-outline" size={wp(14)} color="#D2A645" />
                <Text style={styles.noticeText}>
                  자동 분류가 애매한 항목은 아래에서 직접 카테고리를 선택한 뒤 저장할 수 있어요.
                </Text>
              </View>

              {selectedExcelFile ? (
                <View style={styles.fileInfoCard}>
                  <View style={styles.fileInfoHeader}>
                    <Ionicons name="checkmark-circle" size={wp(18)} color={COLORS.successGreen} />
                    <Text style={styles.fileInfoTitle}>선택한 파일</Text>
                  </View>
                  <Text style={styles.fileInfoName}>{selectedExcelFile.name}</Text>
                  <Text style={styles.fileInfoMeta}>{buildFileSummary(selectedExcelFile)}</Text>
                </View>
              ) : null}

              {isBackendSummaryLoading ? (
                <View style={styles.backendSummaryCard}>
                  <View style={styles.backendSummaryHeader}>
                    <Ionicons name="sync-outline" size={wp(18)} color={COLORS.primary} />
                    <Text style={styles.backendSummaryTitle}>분석 중</Text>
                  </View>
                  <Text style={styles.backendSummaryDescription}>
                    파일을 읽고 자동 분류 결과를 준비하고 있어요.
                  </Text>
                </View>
              ) : null}

              {backendSummaryError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="cloud-offline-outline" size={wp(16)} color={COLORS.spentRed} />
                  <Text style={styles.errorText}>{backendSummaryError}</Text>
                </View>
              ) : null}

              {backendSummary ? (
                <View style={styles.backendSummaryCard}>
                  <View style={styles.backendSummaryHeader}>
                    <Ionicons name="server-outline" size={wp(18)} color={COLORS.primary} />
                    <Text style={styles.backendSummaryTitle}>백엔드 분류 결과</Text>
                  </View>
                  <Text style={styles.backendSummaryDescription}>
                    {backendSummary.message || '분류 결과를 불러왔어요.'}
                  </Text>

                  <View style={styles.backendSummaryStatsGrid}>
                    <SummaryStatCard label="거래 수" value={`${backendSummary.transactionCount}건`} />
                    <SummaryStatCard
                      label="포함 금액"
                      value={`${backendSummary.includedAmount.toLocaleString()}원`}
                    />
                    <SummaryStatCard
                      label="제외 금액"
                      value={`${backendSummary.excludedAmount.toLocaleString()}원`}
                    />
                    <SummaryStatCard
                      label="총 금액"
                      value={`${backendSummary.totalAmount.toLocaleString()}원`}
                    />
                  </View>

                  {backendSummary.records.length > 0 ? (
                    <View style={styles.summaryListSection}>
                      <Text style={styles.summarySectionLabel}>자동 분류 요약</Text>
                      {backendSummary.records.slice(0, 5).map((record) => (
                        <View key={`${record.category}-${record.cnt}`} style={styles.summaryListRow}>
                          <Text style={styles.summaryListLabel}>{record.category}</Text>
                          <Text style={styles.summaryListValue}>
                            {record.cnt}건 · {record.amt.toLocaleString()}원
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {backendSummary.excludedRows.length > 0 ? (
                    <View style={styles.summaryListSection}>
                      <Text style={styles.summarySectionLabel}>제외 항목</Text>
                      {backendSummary.excludedRows.slice(0, 4).map((row, index) => (
                        <View
                          key={`${row.merchantName}-${row.classificationReason}-${index}`}
                          style={styles.summaryListRow}
                        >
                          <View style={styles.summaryListTextWrap}>
                            <Text style={styles.summaryListLabel}>{row.merchantName}</Text>
                            <Text style={styles.summaryListReason}>{row.classificationReason}</Text>
                          </View>
                          <Text style={styles.summaryListValue}>
                            {row.cnt}건 · {row.amount.toLocaleString()}원
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              {confirmErrorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="cloud-offline-outline" size={wp(16)} color={COLORS.spentRed} />
                  <Text style={styles.errorText}>{confirmErrorMessage}</Text>
                </View>
              ) : null}

              {uploadErrorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={wp(16)} color={COLORS.spentRed} />
                  <Text style={styles.errorText}>{uploadErrorMessage}</Text>
                </View>
              ) : null}

              {uploadGroups.map((group) => {
                const needsCategoryCount = group.items.filter(
                  (item) => item.status === 'needs-category',
                ).length;

                return (
                  <View key={group.dateKey} style={styles.uploadResultSection}>
                    <View style={styles.uploadResultHeader}>
                      <Text style={styles.uploadResultDate}>{group.dateKey}</Text>
                      <Text style={styles.uploadResultSummary}>
                        {group.totalCount}건
                        <Text style={styles.uploadResultNeedsCategory}>
                          {' '}
                          · 분류 필요 {needsCategoryCount}건
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
                            <Text style={styles.uploadResultAmount}>-{item.amount.toLocaleString()}원</Text>
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
                    (hasPendingCategories || !hasUploadEntries || isConfirmLoading) && styles.primaryButtonDisabled,
                  ]}
                  disabled={hasPendingCategories || !hasUploadEntries || isConfirmLoading}
                  onPress={handleCompleteExcelUpload}
                >
                  <Text style={styles.primaryButtonText}>
                    {isConfirmLoading
                      ? '저장 중...'
                      : hasPendingCategories
                        ? '카테고리를 모두 선택해주세요'
                        : hasUploadEntries
                          ? '캘린더에 저장'
                          : '업로드 후 저장할 수 있어요'}
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
        title="카테고리 선택"
        subtitle={
          selectedUploadItem
            ? `${selectedUploadItem.merchantName} · ${selectedUploadItem.amount.toLocaleString()}원`
            : ''
        }
        scrollable={false}
      >
        <View style={styles.categorySelectWrap}>
          <View style={styles.recommendBadge}>
            <Ionicons name="sparkles-outline" size={wp(12)} color={COLORS.warningOrange} />
            <Text style={styles.recommendBadgeText}>자동 분류가 애매한 항목은 직접 고를 수 있어요.</Text>
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

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStatCard}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
    </View>
  );
}


function buildUploadGroupsFromBackendItems(items: CalendarUploadBackendItem[]) {
  const groupedItems = new Map<string, CalendarUploadPreviewGroup['items']>();

  items.forEach((item, index) => {
    const dateKey = item.transactionDate;
    if (!dateKey) {
      return;
    }

    const nextItem = {
      id: `backend-${dateKey}-${index}`,
      merchantName: item.merchantName,
      amount: item.amount,
      categoryLabel: item.category || '?? ??',
      status: item.status,
      description: item.transactionDetail || item.classificationReason || undefined,
      categoryId: item.categoryId,
    };

    groupedItems.set(dateKey, [...(groupedItems.get(dateKey) ?? []), nextItem]);
  });

  return Array.from(groupedItems.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, groupedDateItems]) => ({
      dateKey,
      totalCount: groupedDateItems.length,
      items: groupedDateItems,
    }));
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function buildFileSummary(file: CalendarUploadFile) {
  if (!file.size) {
    return file.mimeType ?? '파일 정보 없음';
  }

  const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
  return `${fileSizeKb}KB${file.mimeType ? ` · ${file.mimeType}` : ''}`;
}

function buildUploadRequest(file: CalendarUploadFile) {
  const lowerName = file.name.toLowerCase();
  const isCardFile = lowerName.includes('card') || lowerName.includes('카드');

  return {
    bankFile: isCardFile ? null : file,
    cardFile: isCardFile ? file : null,
  };
}
