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
  detailItemsByCategory: Record<
    string,
    Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      isEnabled: boolean;
      category: string;
    }>
  >;
  onToggleExpand: (id: string) => void;
  onPressManage: () => void;
}

/**
 * 캘린더 하단 고정지출 요약 영역입니다. 관리 화면으로 이어지는 진입점 역할도 함께 맡습니다.
 */
export default function FixedExpenseSection({
  totalAmount,
  items,
  detailItemsByCategory,
  onToggleExpand,
  onPressManage,
}: FixedExpenseSectionProps) {
  return (
    <SurfaceCard>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.pinEmoji}>📌</Text>
          <Text style={styles.headerTitle}>고정지출</Text>
        </View>
        <TouchableOpacity activeOpacity={0.86} onPress={onPressManage}>
          <Text style={styles.manageText}>관리</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalLabel}>전체 ₩{totalAmount.toLocaleString()}</Text>

      <View style={styles.list}>
        {items.map((item) => {
          const detailItems = detailItemsByCategory[item.title] ?? [];

          return (
            <View key={item.id} style={styles.groupBlock}>
              {/*
                이전 코드:
                - 카테고리 요약 행만 있고, 실제 연결 항목은 여기서 볼 수 없었습니다.

                변경 이유:
                - 사용자가 "주거/통신 같은 카테고리 박스"를 눌렀을 때만 상세를 열어
                  카테고리는 상세 조회에서만 보이게 맞춥니다.
              */}
              <TouchableOpacity activeOpacity={0.9} style={styles.rowCard} onPress={() => onToggleExpand(item.id)}>
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
              </TouchableOpacity>

              {item.isExpanded ? (
                <View style={styles.detailPanel}>
                  {detailItems.length > 0 ? (
                    detailItems.map((detail) => (
                      <View key={detail.id} style={styles.detailRow}>
                        <View style={styles.detailTextBlock}>
                          <View style={styles.detailTitleRow}>
                            <Text style={styles.detailTitle}>{detail.title}</Text>
                            <View style={styles.detailCategoryBadge}>
                              <Text style={styles.detailCategoryBadgeText}>{detail.category}</Text>
                            </View>
                          </View>
                          <Text style={styles.detailSubtitle}>
                            {stripCategoryFromSubtitle(detail.subtitle, detail.category)}
                          </Text>
                        </View>

                        <View style={styles.detailRight}>
                          <Text style={styles.detailAmount}>₩{detail.amount.toLocaleString()}</Text>
                          <Text style={styles.detailStatus}>
                            {detail.isEnabled ? '자동 반영 중' : '비활성'}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyDetailText}>아직 연결된 고정지출 항목이 없어요.</Text>
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

function stripCategoryFromSubtitle(subtitle: string, category: string) {
  return subtitle.replace(new RegExp(`\\s*${category}$`), '').trim();
}
