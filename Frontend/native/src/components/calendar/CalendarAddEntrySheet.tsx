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
import type { CalendarUploadFile, CalendarUploadPreviewGroup, ManualCalendarEntryDraft } from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';

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
                  <Ionicons name="document-text-outline" size={wp(24)} color={COLORS.excelIconGold} />
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
                    <Ionicons name="checkmark-circle" size={wp(18)} color={COLORS.successGreen} />
                    <Text style={styles.fileInfoTitle}>파일 선택 완료</Text>
                  </View>
                  <Text style={styles.fileInfoName}>{selectedExcelFile.name}</Text>
                  <Text style={styles.fileInfoMeta}>{buildFileSummary(selectedExcelFile)}</Text>
                </View>
              ) : null}

              {uploadErrorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={wp(16)} color={COLORS.spentRed} />
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
            <Ionicons name="sparkles-outline" size={wp(12)} color={COLORS.warningOrange} />
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

