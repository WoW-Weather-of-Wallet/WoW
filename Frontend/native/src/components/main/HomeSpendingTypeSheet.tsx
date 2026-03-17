import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { spendingTypeLegend } from '../../constants/main/homeSheetData';
import LegendList from './LegendList';
import ReasonHighlightCard from './ReasonHighlightCard';
import SheetIconHeader from './SheetIconHeader';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';

interface HomeSpendingTypeSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function HomeSpendingTypeSheet({
  visible,
  onClose,
}: HomeSpendingTypeSheetProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} showHandle>
      <View style={styles.sheetHeader}>
        <SheetIconHeader
          iconName="restaurant-outline"
          eyebrow="AI 소비 유형 분석"
          title="미식 탐험가형"
        />
      </View>

      <View style={styles.introBox}>
        <Text style={styles.introText}>
          식비가 전체 지출의 <Text style={styles.accent}>35%</Text>로 가장 높은
          비중을 차지해요. 경험과 맛에 적극 투자하는 라이프스타일이에요.
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
        title="식비 비중 압도적 1위"
        description="전체 지출의 35%가 식비예요. 또래 평균보다 높은 편이라 맛집 탐방과 외식에 적극적인 패턴으로 보여요."
        tone="red"
      />
      <ReasonHighlightCard
        title="문화·여가 소비도 활발"
        description="문화와 여가 지출이 상위권이라 새로운 경험을 찾아다니는 성향이 함께 보입니다."
        tone="purple"
      />
      <ReasonHighlightCard
        title="절약 포인트 제안"
        description="식비를 월 3만원만 줄여도 연간 36만원을 아낄 수 있어요. 집밥 챌린지나 구독 정리를 함께 추천해요."
        tone="green"
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetHeader: { marginBottom: hp(2) },
  introBox: {
    borderRadius: RADIUS.xl,
    backgroundColor: '#F4F2FF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(18),
  },
  introText: {
    fontSize: fp(15),
    lineHeight: fp(24),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  accent: { color: COLORS.primary, fontFamily: FONTS.bold },
  sheetSectionTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(14),
  },
  styleMapCard: {
    flexDirection: 'row',
    gap: wp(18),
    marginBottom: hp(20),
    alignItems: 'center',
  },
  styleLegend: { flex: 1, justifyContent: 'center' },
});
