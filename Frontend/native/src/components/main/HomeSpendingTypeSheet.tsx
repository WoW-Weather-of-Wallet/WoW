import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import type { SpendingStyleMetric } from '../../constants/main/types';
import LegendList from './LegendList';
import ReasonHighlightCard from './ReasonHighlightCard';
import SheetIconHeader from './SheetIconHeader';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';
import SpendingStyleGuideModal from './SpendingStyleGuideModal';
import { styles } from './HomeSpendingTypeSheet.styles';

type ReasonTone = 'red' | 'purple' | 'green';

interface HomeSpendingTypeSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string | null;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  description?: string | null;
  metrics?: SpendingStyleMetric[];
  reasons?: Array<{
    title: string;
    description: string;
    tone: ReasonTone;
  }>;
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
  const displayMetrics = metrics ?? [];
  const displayReasons =
    reasons && reasons.length > 0
      ? reasons
      : [
          {
            title: '분석 결과 대기 중',
            description: '거래 데이터가 쌓이면 카테고리별 소비 성향과 주요 패턴을 이곳에서 확인할 수 있어요.',
            tone: 'purple' as const,
          },
        ];

  return (
    <>
      <BottomSheetModal visible={visible} onClose={onClose} showHandle>
      <View style={styles.sheetHeader}>
        <SheetIconHeader
          iconName={iconName}
          eyebrow="AI 소비 유형 분석"
          title={title || '분석 전'}
          onPressInfo={() => setIsGuideVisible(true)}
        />
      </View>

      <View style={styles.introBox}>
        <Text style={styles.introText}>
          {description || '아직 6개월 소비 분석 결과가 없어요. 거래 데이터를 조금 더 쌓아보세요.'}
        </Text>
      </View>

      <Text style={styles.sheetSectionTitle}>소비 스타일맵</Text>
      <View style={styles.styleMapCard}>
        {displayMetrics.length > 0 ? (
          <>
            <SpendingStyleRadarChart metrics={displayMetrics} />
            <View style={styles.styleLegend}>
              <LegendList items={displayMetrics} />
            </View>
          </>
        ) : (
          <Text style={styles.introText}>
            아직 표시할 카테고리별 소비 비중 데이터가 없어요.
          </Text>
        )}
      </View>

      <Text style={styles.sheetSectionTitle}>AI가 이렇게 판단한 이유</Text>
      {displayReasons.map((reason, index) => (
        <ReasonHighlightCard
          key={`${reason.title}-${index}`}
          title={reason.title}
          description={reason.description}
          tone={reason.tone}
        />
      ))}
      </BottomSheetModal>

      <SpendingStyleGuideModal
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
}
