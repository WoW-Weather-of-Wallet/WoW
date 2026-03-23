import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  useDerivedValue,
  useAnimatedProps
} from 'react-native-reanimated';
import { styles } from './AiResultScreen.styles';
import GradientButton from '../../components/common/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp, hp } from '../../constants/theme';
import DataSourceNotice from '../../components/common/DataSourceNotice';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * [Mock-Data] 분석 결과 리포트 시각화를 위한 목업 데이터
 */
const CLUSTER_DATA = {
  name: "사무·서적형",
  desc: "사무/교육용품과 서적/도서 비중이 매우 높고 분식 소비가 함께 나타나는 학습 집중형 유형",
};

const OVERSPENDING_DATA = [
  { name: '커피/음료', myRate: 23.3, avgRate: 8.9, saveAmt: 16322 },
  { name: '육류/회식', myRate: 19.3, avgRate: 7.7, saveAmt: 11186 },
  { name: '음/식료품소매', myRate: 5.6, avgRate: 0.0, saveAmt: 936 },
  { name: '제과/제빵/떡/케익', myRate: 5.2, avgRate: 0.1, saveAmt: 814 },
];

const CATEGORY_DATA = [
  { name: '커피/음료', price: 233500, myRate: 23.3, avgRate: 8.9, diff: '+14.4%p', isOver: true },
  { name: '육류/회식', price: 193200, myRate: 19.3, avgRate: 7.7, diff: '+11.6%p', isOver: true },
  { name: '분식', price: 167600, myRate: 16.8, avgRate: 18.2, diff: '-1.5%p', isOver: false },
  { name: '서적/도서', price: 121500, myRate: 12.1, avgRate: 11.2, diff: '+0.9%p', isOver: true },
  { name: '사무/교육용품', price: 115700, myRate: 11.6, avgRate: 21.8, diff: '-10.3%p', isOver: false },
  { name: '음/식료품소매', price: 55700, myRate: 5.6, avgRate: 0.0, diff: '+5.6%p', isOver: true },
  { name: '제과/제빵/떡/케익', price: 52200, myRate: 5.2, avgRate: 0.0, diff: '+5.2%p', isOver: true },
  { name: '외식', price: 26200, myRate: 2.6, avgRate: 0.0, diff: '+2.6%p', isOver: true },
];

/**
 * [UI-Component] 숫자가 카운팅되는 애니메이션 텍스트 컴포넌트입니다.
 * ⚠️ UI 스레드에서 정밀한 포맷팅을 처리하기 위해 formatter 함수 프롭 대신 type 프롭을 사용합니다.
 */
const AnimatedNumber = ({ 
  value, 
  duration = 1000, 
  delay = 0, 
  type = 'none', // 'price' | 'percentage' | 'none'
  style 
}: { 
  value: number, 
  duration?: number, 
  delay?: number,
  type?: 'price' | 'percentage' | 'none',
  style?: any
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withDelay(delay, withTiming(value, { duration }));
  }, [value, delay, duration]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    let text = '';
    const numericValue = animatedValue.value;

    if (type === 'price') {
      const val = Math.floor(numericValue);
      // 정규식을 활용한 3자리 콤마 포맷팅 (워크릿 안전)
      text = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원';
    } else if (type === 'percentage') {
      text = numericValue.toFixed(1) + '%';
    } else {
      text = Math.floor(numericValue).toString();
    }

    return {
      text,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      defaultValue={'0'} 
      style={[
        style, 
        { 
          padding: 0, 
          margin: 0, 
          includeFontPadding: false,
          textAlignVertical: 'center',
        }
      ]}
      animatedProps={animatedProps}
    />
  );
};

/**
 * [UI-Component] 차트의 막대가 차오르는 애니메이션을 적용한 바(Bar) 컴포넌트입니다.
 */
const AnimatedBar = ({ targetWidth, color, delay = 0 }: { targetWidth: number, color: string, delay?: number }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(targetWidth, { duration: 1000 }));
  }, [targetWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[
        color === 'primary' ? styles.barFillMy : styles.barFillAvg,
        animatedStyle,
        { backgroundColor: color === 'primary' ? COLORS.primary : COLORS.gray400 }
      ]} />
    </View>
  );
};

export default function AiResultScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const userName = '사용자'; 
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // [Exception-Handling] 데이터 유효성 검사
  const isDataValid = CLUSTER_DATA && CATEGORY_DATA.length > 0 && OVERSPENDING_DATA.length > 0;

  if (!isDataValid) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={wp(60)} color={COLORS.error} />
        <Text style={[styles.cardTitle, { marginTop: hp(16), textAlign: 'center' }]}>
          데이터를 불러올 수 없습니다
        </Text>
        <Text style={[styles.clusterDesc, { textAlign: 'center', marginBottom: hp(24) }]}>
          네트워크 상태를 확인하거나{'\n'}잠시 후 다시 시도해주세요.
        </Text>
        <GradientButton 
          title="홈으로 돌아가기" 
          onPress={() => navigation.navigate('MainTabs')} 
        />
      </View>
    );
  }

  // 테이블 노출 데이터 결정
  const visibleTableData = isTableExpanded ? CATEGORY_DATA : CATEGORY_DATA.slice(0, 3);

  /**
   * [UI-Component] 과소비 항목 막대 그래프 섹션
   */
  const renderOverspendingChart = () => (
    <Animated.View 
      entering={FadeInDown.delay(400).duration(800)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>과소비 항목 (클러스터 기준 초과)</Text>
      {OVERSPENDING_DATA.map((item, index) => (
        <View key={index} style={styles.chartRow}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.chartSaving}>약 </Text>
              <AnimatedNumber 
                value={item.saveAmt} 
                delay={600 + index * 100}
                type="price"
                style={styles.chartSaving}
              />
              <Text style={styles.chartSaving}>원 절감 가능</Text>
            </View>
          </View>
          
          <AnimatedBar targetWidth={Math.min(item.myRate * 3, 100)} color="primary" delay={600 + index * 100} />
          <AnimatedBar targetWidth={Math.min(item.avgRate * 3, 100)} color="gray" delay={600 + index * 100} />
          
          <View style={styles.barLegend}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.barLegendText}>내 비율: </Text>
              <AnimatedNumber 
                value={item.myRate} 
                delay={600 + index * 100}
                type="percentage"
                style={styles.barLegendText}
              />
              <Text style={styles.barLegendText}>%</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.barLegendText}>기준 비율: </Text>
              <AnimatedNumber 
                value={item.avgRate} 
                delay={600 + index * 100}
                type="percentage"
                style={styles.barLegendText}
              />
              <Text style={styles.barLegendText}>%</Text>
            </View>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  /**
   * [UI-Component] 카테고리별 소비 현황 비교 표 (확장 기능 포함)
   */
  const renderCategoryTable = () => (
    <Animated.View 
      entering={FadeInDown.delay(600).duration(800)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>카테고리별 소비 현황 vs 클러스터 기준</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={styles.tableCellCat}><Text style={styles.tableHeaderText}>카테고리</Text></View>
          <View style={styles.tableCellPrice}><Text style={styles.tableHeaderText}>지출금액</Text></View>
          <View style={styles.tableCellPct}><Text style={styles.tableHeaderText}>내 비율</Text></View>
          <View style={styles.tableCellDiff}><Text style={styles.tableHeaderText}>차이</Text></View>
        </View>
        
        {visibleTableData.map((item, index) => (
          <View 
            key={index} 
            style={[styles.tableRow, (index === visibleTableData.length - 1 && !isTableExpanded) && { borderBottomWidth: 0 }]}
          >
            <View style={styles.tableCellCat}>
              <Text style={styles.tableDataText} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={styles.tableCellPrice}>
              <AnimatedNumber 
                value={item.price as number} 
                delay={800 + index * 50}
                type="price"
                style={styles.tableDataText}
              />
            </View>
            <View style={styles.tableCellPct}>
              <AnimatedNumber 
                value={item.myRate as number} 
                delay={800 + index * 50}
                type="percentage"
                style={styles.tableDataText}
              />
            </View>
            <View style={styles.tableCellDiff}>
              <Text style={[styles.tableDataText, item.isOver ? styles.textDanger : styles.textSafe]}>
                {item.diff}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => setIsTableExpanded(!isTableExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleButtonText}>
          {isTableExpanded ? '접기' : `더보기 (${CATEGORY_DATA.length - 3})`}
        </Text>
        <Ionicons 
          name={isTableExpanded ? 'chevron-up' : 'chevron-down'} 
          size={wp(16)} 
          color={COLORS.textTertiary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * [UI-Component] 맞춤형 소비 피드백 텍스트 영역
   */
  const renderFeedbackSection = () => (
    <Animated.View 
      entering={FadeInDown.delay(800).duration(800)}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>종합 소비 피드백</Text>
      
      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>1. 소비 패턴 진단</Text>
        <Text style={styles.feedbackText}>
          당신의 소비는 <Text style={styles.feedbackHighlight}>공부·업무에 몰입하는 생활</Text>을 중심으로 짜여 있습니다.{'\n'}
          필요한 책과 사무용품에 기꺼이 투자하면서도, 바쁜 시기일수록{'\n'}
          빠르게 만족을 주는 <Text style={styles.feedbackHighlight}>작은 보상(커피, 간식)</Text>이 자주 필요한 상태입니다.
        </Text>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>2. 핵심 개선 방향</Text>
        <Text style={styles.feedbackText}>
          첫째, <Text style={styles.feedbackHighlight}>집중을 유지하기 위한 소비</Text>를 루틴으로 바꾸세요.{'\n'}
          둘째, 학습·업무 투자를 '구매'가 아닌 '활용' 중심으로 전환하세요.{'\n'}
          셋째, 회식 지출은 <Text style={styles.feedbackHighlight}>사전 방어선</Text>을 만들어 추가 지출을 끊어보세요.
        </Text>
      </View>

      <View style={[styles.feedbackSection, { marginBottom: 0 }]}>
        <Text style={styles.feedbackTitle}>3. 이번 달 절감 목표</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Text style={styles.feedbackText}>비슷한 유형 기준 대비 절감 가능액은 </Text>
          <Text style={styles.feedbackHighlight}>약 </Text>
          <AnimatedNumber 
            value={29258} 
            type="price"
            delay={1000}
            style={styles.feedbackHighlight}
          />
          <Text style={styles.feedbackHighlight}> 입니다.</Text>
        </View>
        <Text style={styles.feedbackText}>
          커피를 <Text style={styles.feedbackHighlight}>하루 1회/주 3회</Text>로 고정하는 규칙 하나만 제대로 세워도{'\n'}
          전체 소비 리듬이 가장 먼저 안정될 것입니다!
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DataSourceNotice
          type="mock"
          description="현재 AI 결과 리포트는 시뮬레이션용 mock 데이터로 표시되고 있습니다."
          style={{ marginBottom: hp(16) }}
        />
        <Animated.View 
          entering={FadeInDown.duration(800)}
          style={styles.header}
        >
          <Text style={styles.userName}>{userName} 님의</Text>
          <Text style={styles.title}>
            <Text style={styles.highlight}>AI 분석 결과</Text>입니다!
          </Text>
        </Animated.View>

        {/* [Section-A] 클러스터 요약 */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.card}
        >
          <View style={styles.clusterBadgeContainer}>
            <View style={styles.clusterBadge}>
              <Text style={styles.clusterBadgeText}>클러스터 1</Text>
            </View>
            <Text style={styles.clusterTitle}>{CLUSTER_DATA.name}</Text>
          </View>
          <Text style={styles.clusterDesc}>{CLUSTER_DATA.desc}</Text>
        </Animated.View>

        {renderOverspendingChart()}
        {renderCategoryTable()}
        {renderFeedbackSection()}

        <Animated.View 
          entering={FadeInDown.delay(1000).duration(800)}
          style={styles.bottomSection}
        >
          <GradientButton 
            title="확인 완료" 
            onPress={() => {
              navigation.navigate('MainTabs');
            }}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
