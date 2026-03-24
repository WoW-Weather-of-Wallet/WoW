import React, { useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import { spendingTypeLegend } from '../../constants/main/homeSheetData';
import LegendList from './LegendList';
import ReasonHighlightCard from './ReasonHighlightCard';
import SheetIconHeader from './SheetIconHeader';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';
import SpendingStyleGuideModal from './SpendingStyleGuideModal';
import { styles } from './HomeSpendingTypeSheet.styles';

interface HomeSpendingTypeSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function HomeSpendingTypeSheet({
  visible,
  onClose,
}: HomeSpendingTypeSheetProps) {
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  return (
    <>
      <BottomSheetModal visible={visible} onClose={onClose} showHandle>
      <View style={styles.sheetHeader}>
        <SheetIconHeader
          iconName="restaurant-outline"
          eyebrow="AI 소비 유형 분석"
          title="미식 탐험가형"
          onPressInfo={() => setIsGuideVisible(true)}
        />
      </View>

      <View style={styles.introBox}>
        <Text style={styles.introText}>
          {/*
            이전 문구:
            - "식비", "문화·여가"처럼 넓은 생활 카테고리 표현이 남아 있었습니다.

            변경 이유:
            - 이번 작업에서는 프론트 전역 카테고리를 expense_category 기준으로
              일치시키는 것이 목적이므로, 상세 설명도 실제 분류명으로 맞춥니다.
          */}
          외식이 전체 지출의 <Text style={styles.accent}>35%</Text>로 가장 높은
          비중을 차지해요. 커피/음료와 공연관람까지 함께 높은 편이라 경험
          소비가 강한 라이프스타일이에요.
        </Text>
      </View>

      <Text style={styles.sheetSectionTitle}>소비 스타일맵</Text>
      <View style={styles.styleMapCard}>
        <SpendingStyleRadarChart metrics={spendingTypeLegend} />
        <View style={styles.styleLegend}>
          <LegendList items={spendingTypeLegend} />
        </View>
      </View>

      <Text style={styles.sheetSectionTitle}>AI가 이렇게 판단한 이유</Text>
      <ReasonHighlightCard
        title="외식 비중 압도적 1위"
        description="전체 지출의 35%가 외식이에요. 또래 평균보다 높은 편이라 맛집 탐방과 식사 경험에 적극적인 패턴으로 보여요."
        tone="red"
      />
      <ReasonHighlightCard
        title="공연관람 소비도 활발"
        description="공연관람과 커피/음료 지출이 상위권이라 새로운 경험과 외부 활동을 즐기는 성향이 함께 보입니다."
        tone="purple"
      />
      <ReasonHighlightCard
        title="절약 포인트 제안"
        description="외식과 커피/음료를 월 3만원만 줄여도 연간 36만원을 아낄 수 있어요. 집밥 챌린지나 카페 지출 정리를 함께 추천해요."
        tone="green"
      />
      </BottomSheetModal>

      <SpendingStyleGuideModal
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
}
