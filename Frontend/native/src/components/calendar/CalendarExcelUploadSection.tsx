import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CALENDAR_EXCEL_BANKS } from '../../constants/calendar/addEntry';
import { COLORS, wp } from '../../constants/theme';
import type {
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
} from '../../types/calendar';
import { buildFileSummary as buildCalendarFileSummary } from '../../utils/calendarAddEntry';
import { styles } from './calendarAddEntryUi';
import CalendarUploadBackendSummaryCard from './CalendarUploadBackendSummaryCard';
import CalendarUploadResultSection from './CalendarUploadResultSection';

interface CalendarExcelUploadSectionProps {
  selectedExcelFile: CalendarUploadFile | null;
  backendSummary: CalendarUploadBackendSummary | null;
  backendSummaryError: string | null;
  uploadErrorMessage: string | null;
  confirmErrorMessage: string | null;
  uploadGroups: CalendarUploadPreviewGroup[];
  isBackendSummaryLoading: boolean;
  isConfirmLoading: boolean;
  hasPendingCategories: boolean;
  hasUploadEntries: boolean;
  onOpenGuide: () => void;
  onPickFile: () => void;
  onPressItem: (itemId: string) => void;
  onComplete: () => void;
}

export default function CalendarExcelUploadSection({
  selectedExcelFile,
  backendSummary,
  backendSummaryError,
  uploadErrorMessage,
  confirmErrorMessage,
  uploadGroups,
  isBackendSummaryLoading,
  isConfirmLoading,
  hasPendingCategories,
  hasUploadEntries,
  onOpenGuide,
  onPickFile,
  onPressItem,
  onComplete,
}: CalendarExcelUploadSectionProps) {
  return (
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
          <View style={styles.excelHeaderRow}>
            <Text style={styles.excelTitle}>엑셀 파일 업로드</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onOpenGuide}
              style={styles.excelInfoButton}
            >
              <Ionicons
                name="information-circle-outline"
                size={wp(16)}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.excelDescription}>
            카드 CSV나 은행 엑셀 파일을 올리면 거래를 분석해서 날짜별 내역으로 정리해드립니다.
          </Text>
        </View>
      </View>

      <View style={styles.bankRow}>
        <Text style={styles.bankLabel}>지원 기관</Text>
        <View style={styles.bankChipWrap}>
          {CALENDAR_EXCEL_BANKS.map((bank) => (
            <View key={bank} style={styles.bankChip}>
              <Text style={styles.bankChipText}>{bank}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.uploadBox} onPress={onPickFile}>
        <Ionicons name="folder-open" size={wp(40)} color="#E2C35A" />
        <Text style={styles.uploadTitle}>
          {selectedExcelFile ? selectedExcelFile.name : '업로드할 파일을 선택해주세요'}
        </Text>
        <Text style={styles.uploadHint}>
          {selectedExcelFile
            ? buildCalendarFileSummary(selectedExcelFile)
            : '.xlsx, .csv, .xls 형식을 지원합니다'}
        </Text>
      </TouchableOpacity>

      <View style={styles.noticeBox}>
        <Ionicons name="bulb-outline" size={wp(14)} color="#D2A645" />
        <Text style={styles.noticeText}>
          자동 분류가 어려운 항목은 직접 카테고리를 지정한 뒤 저장할 수 있습니다.
        </Text>
      </View>

      {selectedExcelFile ? (
        <View style={styles.fileInfoCard}>
          <View style={styles.fileInfoHeader}>
            <Ionicons name="checkmark-circle" size={wp(18)} color={COLORS.successGreen} />
            <Text style={styles.fileInfoTitle}>선택된 파일</Text>
          </View>
          <Text style={styles.fileInfoName}>{selectedExcelFile.name}</Text>
          <Text style={styles.fileInfoMeta}>{buildCalendarFileSummary(selectedExcelFile)}</Text>
        </View>
      ) : null}

      {isBackendSummaryLoading ? (
        <View style={styles.backendSummaryCard}>
          <View style={styles.backendSummaryHeader}>
            <Ionicons name="sync-outline" size={wp(18)} color={COLORS.primary} />
            <Text style={styles.backendSummaryTitle}>분석 중</Text>
          </View>
          <Text style={styles.backendSummaryDescription}>
            업로드한 파일을 분석해서 날짜별 거래를 정리하고 있습니다.
          </Text>
        </View>
      ) : null}

      {backendSummaryError ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={wp(16)} color={COLORS.spentRed} />
          <Text style={styles.errorText}>{backendSummaryError}</Text>
        </View>
      ) : null}

      {backendSummary ? <CalendarUploadBackendSummaryCard summary={backendSummary} /> : null}

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

      {uploadGroups.map((group) => (
        <CalendarUploadResultSection
          key={group.dateKey}
          group={group}
          onPressItem={onPressItem}
        />
      ))}

      {selectedExcelFile ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.primaryButton,
            (hasPendingCategories || !hasUploadEntries || isConfirmLoading) &&
              styles.primaryButtonDisabled,
          ]}
          disabled={hasPendingCategories || !hasUploadEntries || isConfirmLoading}
          onPress={onComplete}
        >
          <Text style={styles.primaryButtonText}>
            {isConfirmLoading
              ? '저장 중...'
              : hasPendingCategories
                ? '카테고리를 모두 선택해주세요'
                : hasUploadEntries
                  ? '업로드 내역 저장'
                  : '업로드할 내역이 없습니다'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}
