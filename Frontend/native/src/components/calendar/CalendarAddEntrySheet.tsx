import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Dimensions, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import type { CalendarEntryCategoryKey } from '../../constants/calendar/addEntry';
import {
  isCsvFile,
  isSpreadsheetFile,
  parseCsvToUploadGroups,
  parseSpreadsheetToUploadGroups,
} from '../../constants/calendar/excel';
import { useCalendarAddEntryForm } from '../../hooks/useCalendarAddEntryForm';
import {
  getCalendarApiErrorMessage,
  saveCalendarOverrides,
  uploadCalendarTransactions,
} from '../../services/calendar';
import {
  buildOverrideRows as buildCalendarOverrideRows,
  buildUploadGroupsFromBackendItems as buildCalendarUploadGroupsFromBackendItems,
  buildUploadRequest as buildCalendarUploadRequest,
  mergeUploadGroupsWithBackendItems as mergeCalendarUploadGroupsWithBackendItems,
} from '../../utils/calendarAddEntry';
import ExcelUploadGuideModal from './ExcelUploadGuideModal';
import CalendarDatePickerSheet from './CalendarDatePickerSheet';
import CalendarDirectCategorySheet from './CalendarDirectCategorySheet';
import CalendarDirectEntrySection from './CalendarDirectEntrySection';
import CalendarEntryModeToggle from './CalendarEntryModeToggle';
import CalendarExcelUploadSection from './CalendarExcelUploadSection';
import CalendarUploadCategorySheet from './CalendarUploadCategorySheet';
import type {
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
  ManualCalendarEntryDraft,
} from '../../types/calendar';

interface CalendarAddEntrySheetProps {
  visible: boolean;
  defaultDateKey: string;
  onClose: () => void;
  onCompleteManualEntries: (entries: ManualCalendarEntryDraft[]) => Promise<void> | void;
  onCompleteExcelEntries: (entries: ManualCalendarEntryDraft[]) => Promise<void> | void;
}

const INITIAL_UPLOAD_GROUPS: CalendarUploadPreviewGroup[] = [];

export default function CalendarAddEntrySheet({
  visible,
  defaultDateKey,
  onClose,
  onCompleteManualEntries,
  onCompleteExcelEntries,
}: CalendarAddEntrySheetProps) {
  const screenHeight = Dimensions.get('window').height;
  const sheetBodyHeight = Math.min(620, screenHeight * 0.74);
  const {
    activeMode,
    dateKey,
    selectedCategory,
    selectedPaymentMethod,
    merchantName,
    amountInput,
    draftEntries,
    selectedExcelFile,
    isAddEnabled,
    setActiveMode,
    setDateKey,
    setSelectedCategory,
    setSelectedPaymentMethod,
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
  const [isExcelGuideVisible, setIsExcelGuideVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isDirectCategorySheetVisible, setIsDirectCategorySheetVisible] = useState(false);

  const handleOpenExcelGuide = useCallback(() => {
    setIsExcelGuideVisible(true);
  }, []);

  const handleExcelGuideClose = useCallback(() => {
    setIsExcelGuideVisible(false);
  }, []);

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
    setIsDatePickerVisible(false);
    setIsDirectCategorySheetVisible(false);
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
        getCalendarApiErrorMessage(
          error,
          '직접 입력 내역을 저장하지 못했습니다. 다시 시도해주세요.',
        ),
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

    let nextGroups: CalendarUploadPreviewGroup[] = [];

    try {
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
        setUploadErrorMessage('csv, xls, xlsx 형식의 파일만 업로드할 수 있습니다.');
        return;
      }

      setUploadGroups(nextGroups);

      if (nextGroups.length === 0) {
        setUploadErrorMessage('파일에서 불러올 거래 내역을 찾지 못했습니다.');
      }
    } catch (error) {
      console.warn('Failed to parse upload file locally', error);
      setUploadGroups([]);
      setUploadErrorMessage('파일을 읽지 못했습니다. 다른 파일을 선택한 뒤 다시 시도해주세요.');
    }

    try {
      const summary = await uploadCalendarTransactions(buildCalendarUploadRequest(nextFile));
      console.log('[calendar upload] backend summary', {
        message: summary.message,
        recordCount: summary.records.length,
        itemCount: summary.items.length,
        excludedCount: summary.excludedRows.length,
        sampleItems: summary.items.slice(0, 5),
      });
      setBackendSummary(summary);

      if (summary.items.length > 0) {
        const backendGroups = buildCalendarUploadGroupsFromBackendItems(summary.items);
        console.log('[calendar upload] backend groups', {
          groupCount: backendGroups.length,
          sampleGroups: backendGroups.slice(0, 3),
        });
        setUploadGroups(
          backendGroups.length > 0
            ? backendGroups
            : mergeCalendarUploadGroupsWithBackendItems(
                nextGroups,
                summary.items,
              ),
        );
        setUploadErrorMessage(null);
      } else {
        console.log('[calendar upload] backend items empty');
      }
    } catch (error) {
      console.warn('Failed to upload calendar file to backend', error);
      setBackendSummaryError(
        getCalendarApiErrorMessage(
          error,
          '업로드 파일 분석에 실패했습니다. 다시 시도해주세요.',
        ),
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
        paymentMethod: 'card',
        categoryId: item.categoryId,
      })),
    );

    setConfirmErrorMessage(null);
    setIsConfirmLoading(true);

    try {
      const overrideRows = buildCalendarOverrideRows(uploadGroups, backendSummary?.items ?? []);
      if (overrideRows.length > 0) {
        await saveCalendarOverrides(overrideRows);
      }

      await Promise.resolve(onCompleteExcelEntries(nextEntries));
      onClose();
    } catch (error) {
      console.warn('Failed to confirm uploaded calendar entries', error);
      setConfirmErrorMessage(
        getCalendarApiErrorMessage(
          error,
          '업로드 내역을 저장하지 못했습니다. 다시 시도해주세요.',
        ),
      );
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <>
      <ExcelUploadGuideModal visible={isExcelGuideVisible} onClose={handleExcelGuideClose} />
      <CalendarDatePickerSheet
        visible={isDatePickerVisible}
        initialDateKey={dateKey}
        title="날짜 선택"
        onClose={() => setIsDatePickerVisible(false)}
        onSelectDate={(nextDateKey) => {
          setDateKey(nextDateKey);
          setIsDatePickerVisible(false);
        }}
      />

      <BottomSheetModal
        visible={visible}
        onClose={onClose}
        scrollable={false}
        showCloseButton={false}
        subtitle=""
      >
        <View style={{ height: sheetBodyHeight, minHeight: 420 }}>
          <CalendarEntryModeToggle activeMode={activeMode} onChangeMode={setActiveMode} />

          {activeMode === 'direct' ? (
            <CalendarDirectEntrySection
              dateKey={dateKey}
              selectedCategory={selectedCategory}
              selectedPaymentMethod={selectedPaymentMethod}
              merchantName={merchantName}
              amountInput={amountInput}
              draftEntries={draftEntries}
              confirmErrorMessage={confirmErrorMessage}
              isAddEnabled={isAddEnabled}
              isConfirmLoading={isConfirmLoading}
              onChangeDateKey={setDateKey}
              onOpenDatePicker={() => setIsDatePickerVisible(true)}
              onOpenCategorySheet={() => setIsDirectCategorySheetVisible(true)}
              onSelectPaymentMethod={setSelectedPaymentMethod}
              onChangeMerchantName={setMerchantName}
              onChangeAmountInput={setAmountInput}
              onAddDraftEntry={addDraftEntry}
              onRemoveDraftEntry={removeDraftEntry}
              onComplete={handleCompleteManualEntries}
            />
          ) : (
            <CalendarExcelUploadSection
              selectedExcelFile={selectedExcelFile}
              backendSummary={backendSummary}
              backendSummaryError={backendSummaryError}
              uploadErrorMessage={uploadErrorMessage}
              confirmErrorMessage={confirmErrorMessage}
              uploadGroups={uploadGroups}
              isBackendSummaryLoading={isBackendSummaryLoading}
              isConfirmLoading={isConfirmLoading}
              hasPendingCategories={hasPendingCategories}
              hasUploadEntries={hasUploadEntries}
              onOpenGuide={handleOpenExcelGuide}
              onPickFile={handlePickExcelFile}
              onPressItem={setSelectedUploadItemId}
              onComplete={handleCompleteExcelUpload}
            />
          )}
        </View>
      </BottomSheetModal>

      <CalendarUploadCategorySheet
        selectedItem={selectedUploadItem}
        onClose={() => setSelectedUploadItemId(null)}
        onSelectCategory={handleSelectUploadCategory}
      />
      <CalendarDirectCategorySheet
        visible={isDirectCategorySheetVisible}
        selectedCategory={selectedCategory}
        onClose={() => setIsDirectCategorySheetVisible(false)}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setIsDirectCategorySheetVisible(false);
        }}
      />
    </>
  );
}
