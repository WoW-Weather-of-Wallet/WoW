import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import type { CalendarUploadBackendSummary } from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';

interface CalendarUploadBackendSummaryCardProps {
  summary: CalendarUploadBackendSummary;
}

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStatCard}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
    </View>
  );
}

export default function CalendarUploadBackendSummaryCard({
  summary,
}: CalendarUploadBackendSummaryCardProps) {
  return (
    <View style={styles.backendSummaryCard}>
      <View style={styles.backendSummaryHeader}>
        <Ionicons name="server-outline" size={18} color={COLORS.primary} />
        <Text style={styles.backendSummaryTitle}>백엔드 분류 결과</Text>
      </View>
      <Text style={styles.backendSummaryDescription}>
        {summary.message || '분류 결과를 불러왔어요.'}
      </Text>

      <View style={styles.backendSummaryStatsGrid}>
        <SummaryStatCard label="거래 수" value={`${summary.transactionCount}건`} />
        <SummaryStatCard label="포함 금액" value={`${summary.includedAmount.toLocaleString()}원`} />
        <SummaryStatCard label="제외 금액" value={`${summary.excludedAmount.toLocaleString()}원`} />
        <SummaryStatCard label="총 금액" value={`${summary.totalAmount.toLocaleString()}원`} />
      </View>

      {summary.records.length > 0 ? (
        <View style={styles.summaryListSection}>
          <Text style={styles.summarySectionLabel}>자동 분류 요약</Text>
          {summary.records.slice(0, 5).map((record) => (
            <View key={`${record.category}-${record.cnt}`} style={styles.summaryListRow}>
              <Text style={styles.summaryListLabel}>{record.category}</Text>
              <Text style={styles.summaryListValue}>
                {record.cnt}건 · {record.amt.toLocaleString()}원
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {summary.excludedRows.length > 0 ? (
        <View style={styles.summaryListSection}>
          <Text style={styles.summarySectionLabel}>제외 항목</Text>
          {summary.excludedRows.slice(0, 4).map((row, index) => (
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
  );
}
