import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, wp } from '../../constants/theme';
import { styles, statusStyles } from './FixedExpenseSection.styles';
import type { FixedExpenseItem } from '../../mock/calendar';

interface FixedExpenseSectionProps {
  totalAmount: number;
  items: FixedExpenseItem[];
  onPressManage: () => void;
}

/**
 * 캘린더 하단 고정지출 요약 영역입니다. 관리 화면으로 이어지는 진입점 역할도 함께 맡습니다.
 */
export default function FixedExpenseSection({
  totalAmount,
  items,
  onPressManage,
}: FixedExpenseSectionProps) {
  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.pinEmoji}>📌</Text>
          <Text style={styles.headerTitle}>고정지출</Text>
          <Text style={styles.filterLabel}>전체</Text>
        </View>
        <TouchableOpacity activeOpacity={0.86} onPress={onPressManage}>
          <Text style={styles.manageText}>관리</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalLabel}>전체 ₩{totalAmount.toLocaleString()}</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.rowCard}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={wp(20)}
                  color={COLORS.textPrimary}
                />
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              {item.statusLabel ? (
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusStyles[item.statusTone].backgroundColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusStyles[item.statusTone].color }]}>
                    {item.statusLabel}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.amount}>
                {item.amount > 0 ? `₩${item.amount.toLocaleString()}` : '₩0'}
              </Text>
              <Ionicons
                name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
                size={wp(16)}
                color={COLORS.textTertiary}
              />
            </View>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
}

