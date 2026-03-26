import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarUploadBackendSummary } from '../../types/calendar';

interface CalendarUploadBackendSummaryCardProps {
  summary: CalendarUploadBackendSummary;
}

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        width: '47%',
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: wp(12),
        paddingVertical: hp(12),
        gap: hp(6),
      }}
    >
      <Text
        style={{
          fontSize: fp(12),
          fontFamily: FONTS.medium,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function CalendarUploadBackendSummaryCard({
  summary,
}: CalendarUploadBackendSummaryCardProps) {
  return (
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
        <Ionicons name="server-outline" size={18} color={COLORS.primary} />
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          백엔드 분류 결과
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
        {summary.message || '분류 결과를 불러왔어요.'}
      </Text>

      <View className="flex-row flex-wrap" style={{ gap: wp(10) }}>
        <SummaryStatCard label="거래 수" value={`${summary.transactionCount}건`} />
        <SummaryStatCard label="포함 금액" value={`${summary.includedAmount.toLocaleString()}원`} />
        <SummaryStatCard label="제외 금액" value={`${summary.excludedAmount.toLocaleString()}원`} />
        <SummaryStatCard label="총 금액" value={`${summary.totalAmount.toLocaleString()}원`} />
      </View>

      {summary.records.length > 0 ? (
        <View style={{ gap: hp(10) }}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            자동 분류 요약
          </Text>
          {summary.records.slice(0, 5).map((record) => (
            <View
              key={`${record.category}-${record.cnt}`}
              className="flex-row items-center justify-between"
              style={{ gap: wp(12) }}
            >
              <Text
                style={{
                  fontSize: fp(13),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textPrimary,
                }}
              >
                {record.category}
              </Text>
              <Text
                style={{
                  fontSize: fp(12),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary,
                }}
              >
                {record.cnt}건 · {record.amt.toLocaleString()}원
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {summary.excludedRows.length > 0 ? (
        <View style={{ gap: hp(10) }}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            제외 항목
          </Text>
          {summary.excludedRows.slice(0, 4).map((row, index) => (
            <View
              key={`${row.merchantName}-${row.classificationReason}-${index}`}
              className="flex-row items-center justify-between"
              style={{ gap: wp(12) }}
            >
              <View className="flex-1" style={{ gap: hp(3) }}>
                <Text
                  style={{
                    fontSize: fp(13),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.textPrimary,
                  }}
                >
                  {row.merchantName}
                </Text>
                <Text
                  style={{
                    fontSize: fp(11),
                    fontFamily: FONTS.medium,
                    color: COLORS.textSecondary,
                  }}
                >
                  {row.classificationReason}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: fp(12),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary,
                }}
              >
                {row.cnt}건 · {row.amount.toLocaleString()}원
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
