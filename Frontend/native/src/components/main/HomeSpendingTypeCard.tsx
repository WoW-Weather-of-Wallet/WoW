import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { useHomeSpendingTypeSummary } from '../../hooks/useHomeSpendingTypeSummary';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeSpendingTypeCard.styles';

interface HomeSpendingTypeCardProps {
  onPress: () => void;
  title?: string | null;
  description?: string | null;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
}

/**
 * 메인 홈 상단의 AI 소비 유형 요약 카드입니다.
 * 사용자가 카드를 누르면 상세 분석 바텀시트가 열립니다.
 */
export default function HomeSpendingTypeCard({
  onPress,
  title,
  description,
  iconName = 'sparkles-outline',
}: HomeSpendingTypeCardProps) {
  const { displayTitle, displayDescription } = useHomeSpendingTypeSummary({
    title,
    description,
  });

  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPress}>
      <SurfaceCard>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>AI 소비 유형 분석</Text>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={iconName}
                  size={wp(18)}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.mainTitle}>{displayTitle}</Text>
            </View>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons
              name="sparkles-outline"
              size={wp(14)}
              color={COLORS.primary}
            />
            <Text style={styles.aiBadgeText}>AI 리포트</Text>
          </View>
        </View>

        <Text style={styles.description}>
          {displayDescription}
        </Text>
      </SurfaceCard>
    </TouchableOpacity>
  );
}
