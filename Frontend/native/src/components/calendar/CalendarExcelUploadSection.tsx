import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CALENDAR_EXCEL_BANKS } from '../../constants/calendar/addEntry';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type {
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadPreviewGroup,
} from '../../types/calendar';
import { buildFileSummary as buildCalendarFileSummary } from '../../utils/calendarAddEntry';
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

function ErrorMessageBox({
  icon,
  message,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
}) {
  return (
    <View
      className="flex-row items-center"
      style={{
        gap: wp(8),
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.errorBackground,
        paddingHorizontal: wp(14),
        paddingVertical: hp(12),
      }}
    >
      <Ionicons name={icon} size={wp(16)} color={COLORS.spentRed} />
      <Text
        style={{
          flex: 1,
          fontSize: fp(13),
          lineHeight: fp(19),
          fontFamily: FONTS.medium,
          color: COLORS.spentRed,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

function RotatingAnalysisIcon() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1250,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
      spinValue.setValue(0);
    };
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="sync-outline" size={wp(18)} color={COLORS.primary} />
    </Animated.View>
  );
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
  const isCompleteDisabled = hasPendingCategories || !hasUploadEntries || isConfirmLoading;

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <ScrollView
        style={{ flex: 1 }}
        bounces={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: hp(16), paddingBottom: hp(20) }}
      >
        <View
          className="flex-row"
          style={{
            gap: wp(14),
            backgroundColor: COLORS.draftCardBackground,
            borderRadius: RADIUS.xl,
            padding: wp(16),
          }}
        >
          <View className="items-center" style={{ width: wp(36), paddingTop: hp(2) }}>
            <Ionicons name="document-text-outline" size={wp(24)} color={COLORS.excelIconGold} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center" style={{ gap: wp(6), marginBottom: hp(6) }}>
              <Text
                style={{
                  fontSize: fp(20),
                  fontFamily: FONTS.bold,
                  color: COLORS.textPrimary,
                }}
              >
                엑셀 파일 업로드
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={onOpenGuide} style={{ padding: wp(4) }}>
                <Ionicons
                  name="information-circle-outline"
                  size={wp(16)}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: fp(14),
                lineHeight: fp(22),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              카드 CSV나 은행 엑셀 파일을 올리면 거래를 분석해서 날짜별 내역으로 정리해드립니다.
            </Text>
          </View>
        </View>

        <View style={{ gap: hp(10) }}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.textSecondary,
            }}
          >
            지원 기관
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: wp(8) }}>
            {CALENDAR_EXCEL_BANKS.map((bank) => (
              <View
                key={bank}
                style={{
                  borderRadius: RADIUS.full,
                  backgroundColor: COLORS.bankChipBackground,
                  paddingHorizontal: wp(10),
                  paddingVertical: hp(5),
                }}
              >
                <Text
                  style={{
                    fontSize: fp(12),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.primary,
                  }}
                >
                  {bank}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          className="items-center justify-center"
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: COLORS.uploadBoxBorder,
            borderRadius: RADIUS.xl,
            backgroundColor: COLORS.uploadBoxBackground,
            paddingHorizontal: wp(20),
            paddingVertical: hp(34),
          }}
          onPress={onPickFile}
        >
          <Ionicons name="folder-open" size={wp(40)} color="#E2C35A" />
          <Text
            style={{
              marginTop: hp(14),
              fontSize: fp(22),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              textAlign: 'center',
            }}
          >
            {selectedExcelFile ? selectedExcelFile.name : '업로드할 파일을 선택해주세요'}
          </Text>
          <Text
            style={{
              marginTop: hp(6),
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            {selectedExcelFile
              ? buildCalendarFileSummary(selectedExcelFile)
              : '.xlsx, .csv, .xls 형식을 지원합니다'}
          </Text>
        </TouchableOpacity>

        <View
          className="flex-row items-center"
          style={{
            gap: wp(8),
            borderRadius: RADIUS.lg,
            backgroundColor: COLORS.noticeBackground,
            paddingHorizontal: wp(14),
            paddingVertical: hp(12),
          }}
        >
          <Ionicons name="bulb-outline" size={wp(14)} color="#D2A645" />
          <Text
            style={{
              flex: 1,
              fontSize: fp(13),
              lineHeight: fp(19),
              fontFamily: FONTS.medium,
              color: COLORS.noticeText,
            }}
          >
            자동 분류가 어려운 항목은 직접 카테고리를 지정한 뒤 저장할 수 있습니다.
          </Text>
        </View>

        {selectedExcelFile ? (
          <View
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.draftCardBackground,
              paddingHorizontal: wp(16),
              paddingVertical: hp(14),
            }}
          >
            <View className="flex-row items-center" style={{ gap: wp(6), marginBottom: hp(8) }}>
              <Ionicons name="checkmark-circle" size={wp(18)} color={COLORS.successGreen} />
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.bold,
                  color: COLORS.successGreen,
                }}
              >
                선택된 파일
              </Text>
            </View>
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(6),
              }}
            >
              {selectedExcelFile.name}
            </Text>
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {buildCalendarFileSummary(selectedExcelFile)}
            </Text>
          </View>
        ) : null}

        {isBackendSummaryLoading ? (
          <View
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.surfaceBorder,
              paddingHorizontal: wp(16),
              paddingVertical: hp(14),
              gap: hp(12),
            }}
          >
            <View className="flex-row items-center" style={{ gap: wp(8) }}>
              <RotatingAnalysisIcon />
              <Text
                style={{
                  fontSize: fp(16),
                  fontFamily: FONTS.bold,
                  color: COLORS.textPrimary,
                }}
              >
                분석 중
              </Text>
            </View>
            <Text
              style={{
                fontSize: fp(13),
                lineHeight: fp(19),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              업로드한 파일을 분석해서 날짜별 거래를 정리하고 있습니다.
            </Text>
          </View>
        ) : null}

        {backendSummaryError ? (
          <ErrorMessageBox icon="cloud-offline-outline" message={backendSummaryError} />
        ) : null}

        {backendSummary ? <CalendarUploadBackendSummaryCard summary={backendSummary} /> : null}

        {confirmErrorMessage ? (
          <ErrorMessageBox icon="cloud-offline-outline" message={confirmErrorMessage} />
        ) : null}

        {uploadErrorMessage ? (
          <ErrorMessageBox icon="alert-circle-outline" message={uploadErrorMessage} />
        ) : null}

        {uploadGroups.map((group) => (
          <CalendarUploadResultSection
            key={group.dateKey}
            group={group}
            onPressItem={onPressItem}
          />
        ))}
      </ScrollView>

      {selectedExcelFile ? (
        <View
          style={{
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
              opacity: isCompleteDisabled ? 0.45 : 1,
            }}
            disabled={isCompleteDisabled}
            onPress={onComplete}
          >
            <Text
              style={{
                fontSize: fp(20),
                fontFamily: FONTS.bold,
                color: COLORS.white,
              }}
            >
              {isConfirmLoading
                ? '저장 중...'
                : hasPendingCategories
                  ? '카테고리를 모두 선택해주세요'
                  : hasUploadEntries
                    ? '업로드 내역 저장'
                    : '업로드할 내역이 없습니다'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
