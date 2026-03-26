import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { useHomeSpendingTypeSummary } from '../../hooks/useHomeSpendingTypeSummary';
import HomeSpendingTypeCardDescription from './HomeSpendingTypeCardDescription';
import HomeSpendingTypeCardHeader from './HomeSpendingTypeCardHeader';

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
        <HomeSpendingTypeCardHeader title={displayTitle} iconName={iconName} />
        <HomeSpendingTypeCardDescription description={displayDescription} />
      </SurfaceCard>
    </TouchableOpacity>
  );
}
