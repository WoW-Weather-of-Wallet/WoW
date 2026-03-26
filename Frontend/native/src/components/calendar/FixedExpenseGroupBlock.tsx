import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles, statusStyles } from './FixedExpenseSection.styles';
import type { FixedExpenseItem } from '../../mock/calendar';

interface FixedExpenseGroupDetail {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  isEnabled: boolean;
  category: string;
}

interface FixedExpenseGroupBlockProps {
  item: FixedExpenseItem;
  detailItems: FixedExpenseGroupDetail[];
  onToggleExpand: (id: string) => void;
}

export default function FixedExpenseGroupBlock({
  item,
  detailItems,
  onToggleExpand,
}: FixedExpenseGroupBlockProps) {
  return (
    <View style={styles.groupBlock}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.rowCard}
        onPress={() => onToggleExpand(item.id)}
      >
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
            {item.amount > 0 ? `₩${item.amount.toLocaleString()}` : '-'}
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
                    {detail.isEnabled ? '활성' : '비활성'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyDetailText}>-</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

function stripCategoryFromSubtitle(subtitle: string, category: string) {
  return subtitle.replace(new RegExp(`\\s*${category}$`), '').trim();
}
