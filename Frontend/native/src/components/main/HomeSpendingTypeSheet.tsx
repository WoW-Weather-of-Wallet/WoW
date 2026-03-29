import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { SpendingStyleMetric } from '../../constants/main/types';
import { hp } from '../../constants/theme';
import {
  type HomeSpendingTypeReason,
  useHomeSpendingTypeSummary,
} from '../../hooks/useHomeSpendingTypeSummary';
import BottomSheetModal from '../common/BottomSheetModal';
import HomeSpendingTypeIntroCard from './HomeSpendingTypeIntroCard';
import HomeSpendingTypeReasonsSection from './HomeSpendingTypeReasonsSection';
import HomeSpendingTypeStyleMapSection from './HomeSpendingTypeStyleMapSection';
import SheetIconHeader from './SheetIconHeader';
import SpendingStyleGuideModal from './SpendingStyleGuideModal';

interface HomeSpendingTypeSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string | null;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  description?: string | null;
  metrics?: SpendingStyleMetric[];
  reasons?: HomeSpendingTypeReason[];
}

export default function HomeSpendingTypeSheet({
  visible,
  onClose,
  title,
  iconName = 'sparkles-outline',
  description,
  metrics,
  reasons,
}: HomeSpendingTypeSheetProps) {
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const {
    displayTitle,
    displayIntroDescription,
    displayMetrics,
    hasMetrics,
    displayReasons,
  } = useHomeSpendingTypeSummary({
    title,
    description,
    metrics,
    reasons,
  });

  return (
    <>
      <BottomSheetModal visible={visible} onClose={onClose} showHandle>
        <View style={{ marginBottom: hp(2) }}>
          <SheetIconHeader
            iconName={iconName}
            eyebrow="AI 소비 유형 분석"
            title={displayTitle}
            onPressInfo={() => setIsGuideVisible(true)}
          />
        </View>

        <HomeSpendingTypeIntroCard description={displayIntroDescription} />

        <HomeSpendingTypeStyleMapSection
          title="소비 스타일맵"
          hasMetrics={hasMetrics}
          metrics={displayMetrics}
          emptyMessage="거래 내역이 더 쌓이면 카테고리별 소비 비중을 보기 쉽게 보여드릴게요."
        />

        <HomeSpendingTypeReasonsSection
          title="AI가 이렇게 판단한 이유"
          reasons={displayReasons}
        />
      </BottomSheetModal>

      <SpendingStyleGuideModal
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
}
