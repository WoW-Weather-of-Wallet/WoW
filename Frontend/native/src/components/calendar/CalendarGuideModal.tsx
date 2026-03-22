import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, hp, wp } from '../../constants/theme';
import MemoIcon from '../../../assets/imgs/calendar/MemoIcon';
import { styles } from './CalendarGuideModal.styles';

interface CalendarGuideModalProps {
  visible: boolean;
  onClose: (hideForever: boolean) => void;
}

const GUIDE_SLIDES = [
  {
    key: 'overview',
    title: '캘린더형과 전체내역형을\n빠르게 오가세요',
    description:
      '상단 토글에서 월간 캘린더와 전체 내역을 바로 전환할 수 있어요. 원하는 방식으로 소비 흐름을 확인하세요.',
    gradient: ['#4E7794', '#3A607B'],
  },
  {
    key: 'memo',
    title: '날짜를 눌러 상세와 메모를\n한 번에 남기세요',
    description:
      '날짜를 선택하면 해당 일자의 소비 내역과 메모를 확인할 수 있어요. 메모가 있는 날짜는 캘린더에 바로 표시됩니다.',
    gradient: ['#6B67A7', '#4E4E96'],
  },
  {
    key: 'upload',
    title: '직접 입력과 CSV 업로드를\n상황에 맞게 쓰세요',
    description:
      '직접 입력으로 빠르게 추가하거나, 파일 업로드로 한 번에 정리할 수 있어요. 마지막에서 다시 보지 않기를 선택할 수 있습니다.',
    gradient: ['#83557E', '#6F3C6A'],
  },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CalendarGuideModal({
  visible,
  onClose,
}: CalendarGuideModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hideForever, setHideForever] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCurrentIndex(0);
    setHideForever(false);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
  }, [visible]);

  const isLastSlide = currentIndex === GUIDE_SLIDES.length - 1;

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(nextIndex);
  }

  function handleNext() {
    if (isLastSlide) {
      onClose(hideForever);
      return;
    }

    scrollRef.current?.scrollTo({
      x: SCREEN_WIDTH * (currentIndex + 1),
      animated: true,
    });
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={() => onClose(hideForever)}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + hp(10) }]}>
          <Text style={styles.headerTitle}>캘린더 가이드</Text>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.closeButton}
            onPress={() => onClose(hideForever)}
          >
            <Ionicons name="close" size={wp(18)} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          style={styles.pager}
        >
          {GUIDE_SLIDES.map((slide) => (
            <View key={slide.key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={styles.previewWrap}>
                <LinearGradient
                  colors={slide.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.phoneFrame}
                >
                  {slide.key === 'overview' ? (
                    <OverviewPreview />
                  ) : slide.key === 'memo' ? (
                    <MemoPreview />
                  ) : (
                    <UploadPreview />
                  )}
                </LinearGradient>
              </View>

              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + hp(16) }]}>
          <View style={styles.indicatorRow}>
            {GUIDE_SLIDES.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.indicatorDot,
                  index === currentIndex && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.preferenceRow}>
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.preferenceTouchable}
              onPress={() => setHideForever((current) => !current)}
            >
              <Ionicons
                name={hideForever ? 'checkmark-circle' : 'ellipse-outline'}
                size={wp(18)}
                color={hideForever ? COLORS.primary : COLORS.textTertiary}
              />
              <Text style={styles.preferenceText}>다시 보지 않기</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.ctaButton, isLastSlide && styles.ctaButtonFinal]}
            onPress={handleNext}
          >
            <Text style={styles.ctaButtonText}>{isLastSlide ? '시작하기' : '다음'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function OverviewPreview() {
  const cells = ['1', '2', '3', '4', '5', '6', '7'];

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewTopRow}>
        <View style={[styles.previewChip, styles.previewChipActive]}>
          <Text style={[styles.previewChipText, styles.previewChipTextActive]}>캘린더형</Text>
        </View>
        <View style={styles.previewGhostButton}>
          <Ionicons name="swap-horizontal-outline" size={wp(14)} color={COLORS.textSecondary} />
        </View>
      </View>

      <View style={styles.previewCalendarGrid}>
        {cells.map((day, index) => (
          <View key={day} style={styles.previewCalendarCell}>
            {index === 2 ? (
              <View style={styles.previewMemoBadge}>
                <MemoIcon size={11} />
              </View>
            ) : null}
            <Text style={styles.previewCalendarNumber}>{day}</Text>
            <Text style={styles.previewCalendarAmount}>{index % 2 === 0 ? '12,000' : '-'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.previewTopRow}>
        <View style={styles.previewChip}>
          <Text style={styles.previewChipText}>전체내역형</Text>
        </View>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textSecondary} />
      </View>
    </View>
  );
}

function MemoPreview() {
  return (
    <View style={styles.previewCard}>
      <View style={styles.detailWeatherCard}>
        <View style={styles.previewTopRow}>
          <Text style={styles.previewChipText}>6월 12일 (목)</Text>
          <MemoIcon size={14} />
        </View>
        <Text style={styles.memoFieldBody}>맑은 날 외식 지출이 조금 높아요.</Text>
      </View>

      <View style={styles.detailMetricRow}>
        <View style={styles.detailMetricCard}>
          <Text style={styles.detailMetricLabel}>지출</Text>
          <Text style={styles.detailMetricValue}>-₩57,100</Text>
        </View>
        <View style={styles.detailMetricCard}>
          <Text style={styles.detailMetricLabel}>건수</Text>
          <Text style={styles.detailMetricValue}>6건</Text>
        </View>
      </View>

      <View style={styles.memoField}>
        <Text style={styles.memoFieldTitle}>오늘의 메모</Text>
        <Text style={styles.memoFieldBody}>
          배달과 카페 지출이 겹쳐서 생각보다 많이 썼다. 다음 주엔 점심 외식을 줄여보자.
        </Text>
      </View>
    </View>
  );
}

function UploadPreview() {
  return (
    <View style={styles.previewCard}>
      <View style={styles.methodRow}>
        <View style={[styles.methodChip, styles.methodChipActive]}>
          <Text style={[styles.methodChipLabel, styles.methodChipLabelActive]}>직접 입력</Text>
        </View>
        <View style={styles.methodChip}>
          <Text style={styles.methodChipLabel}>CSV 업로드</Text>
        </View>
      </View>

      <View style={styles.memoField}>
        <Text style={styles.memoFieldTitle}>거래 추가</Text>
        <Text style={styles.memoFieldBody}>날짜, 카테고리, 카드/현금을 선택해 바로 기록하세요.</Text>
      </View>

      <View style={styles.uploadCard}>
        <Ionicons name="cloud-upload-outline" size={wp(24)} color={COLORS.primary} />
        <Text style={styles.uploadCardTitle}>파일 한 번에 업로드</Text>
        <Text style={styles.uploadCardHint}>CSV는 카드 소비 기준으로 처리됩니다.</Text>
      </View>
    </View>
  );
}
