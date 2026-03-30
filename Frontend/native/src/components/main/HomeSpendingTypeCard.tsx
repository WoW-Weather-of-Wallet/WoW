import React from 'react';
import { TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useHomeSpendingTypeSummary } from '../../hooks/useHomeSpendingTypeSummary';
import SurfaceCard from '../common/SurfaceCard';
import HomeSpendingTypeCardDescription from './HomeSpendingTypeCardDescription';
import HomeSpendingTypeCardHeader from './HomeSpendingTypeCardHeader';

interface HomeSpendingTypeCardProps {
  onPress: () => void;
  title?: string | null;
  description?: string | null;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}

export default function HomeSpendingTypeCard({
  onPress,
  title,
  description,
  iconName = 'sparkles-outline',
  style,
}: HomeSpendingTypeCardProps) {
  const { displayTitle, displayDescription } = useHomeSpendingTypeSummary({
    title,
    description,
  });

  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPress} style={style}>
      <SurfaceCard style={{ flex: 1, justifyContent: 'space-between' }}>
        <HomeSpendingTypeCardHeader title={displayTitle} iconName={iconName} />
        <HomeSpendingTypeCardDescription description={displayDescription} />
      </SurfaceCard>
    </TouchableOpacity>
  );
}
