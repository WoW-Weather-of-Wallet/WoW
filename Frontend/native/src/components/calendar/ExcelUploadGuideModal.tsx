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
import { COLORS, fp, hp, wp } from '../../constants/theme';

/**
 * ExcelUploadGuideModal
 *
 * 엑셀/CSV 파일 업로드 기능을 처음 사용하는 사용자를 위한 3슬라이드 가이드 모달입니다.
 * CalendarGuideModal과 동일한 UX 구조(슬라이드 페이징, 페이지 인디케이터, 다시 보지 않기)를
 * 사용하여 시각적 일관성을 유지합니다.
 *
 * @param visible - 모달 표시 여부
 * @param onClose - 닫기 콜백. `hideForever` 값을 통해 영구 숨김 여부를 부모에 전달합니다.
 */

interface ExcelUploadGuideModalProps {
  visible: boolean;
  onClose: (hideForever: boolean) => void;
}

// ─── 슬라이드 데이터 ───────────────────────────────────────────────────────────
const GUIDE_SLIDES = [
  {
    key: 'prepare',
    title: '은행·카드 내역 파일을\n미리 준비하세요',
    description:
      '은행이나 카드 앱에서 CSV 또는 엑셀(.xlsx) 형식으로 내역을 내려받으세요. 삼성카드, 신한카드, 국민은행 등 주요 포맷을 지원합니다.',
    // 슬라이드마다 그라디언트 색상을 다르게 하여 시각적 다양성을 줍니다.
    gradient: ['#4E7794', '#3A607B'] as [string, string],
  },
  {
    key: 'analyze',
    title: '업로드하면 자동으로\n분류해 드려요',
    description:
      '파일을 선택하면 AI가 거래 내역을 자동으로 분석하고 카테고리를 분류해요. 분류 결과를 미리보기로 확인할 수 있습니다.',
    gradient: ['#6B67A7', '#4E4E96'] as [string, string],
  },
  {
    key: 'review',
    title: '분류가 어긋난 항목은\n직접 수정할 수 있어요',
    description:
      '자동 분류가 애매한 항목은 직접 카테고리를 선택해 수정하세요. 모든 항목이 정리되면 캘린더에 한 번에 저장됩니다.',
    gradient: ['#83557E', '#6F3C6A'] as [string, string],
  },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ExcelUploadGuideModal({
  visible,
  onClose,
}: ExcelUploadGuideModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);

  // 현재 표시 중인 슬라이드 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  // '다시 보지 않기' 체크 상태
  const [hideForever, setHideForever] = useState(false);

  // 모달이 열릴 때마다 첫 슬라이드로 초기화합니다.
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

  // 가로 스크롤이 멈췄을 때 현재 인덱스를 계산합니다.
  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    setCurrentIndex(nextIndex);
  }

  // '다음' 또는 '시작하기' 버튼 처리
  function handleNext() {
    if (isLastSlide) {
      // 마지막 슬라이드에서는 모달을 닫고 hideForever 값을 부모에 전달합니다.
      onClose(hideForever);
      return;
    }
    scrollRef.current?.scrollTo({
      x: SCREEN_WIDTH * (currentIndex + 1),
      animated: true,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={() => onClose(hideForever)}
    >
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* ── 헤더 ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: insets.top + hp(10),
            paddingHorizontal: wp(20),
            paddingBottom: hp(12),
          }}
        >
          <Text
            style={{
              fontSize: fp(15),
              fontWeight: '600',
              color: COLORS.textPrimary,
            }}
          >
            파일 업로드 가이드
          </Text>
          <TouchableOpacity
            activeOpacity={0.86}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onClose(hideForever)}
          >
            <Ionicons name="close" size={wp(20)} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── 슬라이드 페이저 ── */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          style={{ flex: 1 }}
        >
          {GUIDE_SLIDES.map((slide) => (
            <View
              key={slide.key}
              style={{ width: SCREEN_WIDTH, paddingHorizontal: wp(20), paddingTop: hp(24) }}
            >
              {/* 미니 목업 미리보기 영역 */}
              <View style={{ alignItems: 'center', marginBottom: hp(28) }}>
                <LinearGradient
                  colors={slide.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: wp(240),
                    height: hp(200),
                    borderRadius: wp(18),
                    padding: wp(16),
                    justifyContent: 'center',
                    // 살짝 들뜬 느낌을 위한 그림자
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {slide.key === 'prepare' ? (
                    <PreparePreview />
                  ) : slide.key === 'analyze' ? (
                    <AnalyzePreview />
                  ) : (
                    <ReviewPreview />
                  )}
                </LinearGradient>
              </View>

              {/* 슬라이드 텍스트 */}
              <Text
                style={{
                  fontSize: fp(20),
                  fontWeight: '700',
                  color: COLORS.textPrimary,
                  marginBottom: hp(12),
                  lineHeight: fp(28),
                }}
              >
                {slide.title}
              </Text>
              <Text
                style={{
                  fontSize: fp(14),
                  color: COLORS.textSecondary,
                  lineHeight: fp(21),
                }}
              >
                {slide.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ── 푸터 (인디케이터, 다시 보지 않기, CTA) ── */}
        <View
          style={{
            paddingHorizontal: wp(20),
            paddingBottom: insets.bottom + hp(16),
            paddingTop: hp(12),
            gap: hp(12),
          }}
        >
          {/* 페이지 인디케이터 도트 */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(6) }}>
            {GUIDE_SLIDES.map((slide, index) => (
              <View
                key={slide.key}
                style={{
                  width: index === currentIndex ? wp(20) : wp(6),
                  height: hp(6),
                  borderRadius: 99,
                  backgroundColor:
                    index === currentIndex ? COLORS.primary : COLORS.border,
                }}
              />
            ))}
          </View>

          {/* '다시 보지 않기' 토글 */}
          <TouchableOpacity
            activeOpacity={0.86}
            style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}
            onPress={() => setHideForever((current) => !current)}
          >
            <Ionicons
              name={hideForever ? 'checkmark-circle' : 'ellipse-outline'}
              size={wp(18)}
              color={hideForever ? COLORS.primary : COLORS.textTertiary}
            />
            <Text style={{ fontSize: fp(13), color: COLORS.textSecondary }}>
              다시 보지 않기
            </Text>
          </TouchableOpacity>

          {/* 
              CTA 버튼 (다음 / 업로드 시작하기) 
              - 마지막 슬라이드 전까지는 보조 색상(textPrimary, 어두운 색)을 사용하고,
              - 마지막 슬라이드에서는 강조 색상(primary)을 사용하여 완료를 유도합니다.
          */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            style={{
              backgroundColor: isLastSlide ? COLORS.primary : COLORS.textPrimary,
              borderRadius: wp(12),
              paddingVertical: hp(14),
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: fp(15),
                fontWeight: '600',
                color: COLORS.white,
              }}
            >
              {isLastSlide ? '업로드 시작하기' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── 미니 목업 컴포넌트들 ────────────────────────────────────────────────────

/**
 * PreparePreview
 * 슬라이드 1: 파일 선택 화면 미니 목업
 * 파일 선택 드롭존과 지원 포맷 뱃지를 보여줍니다.
 */
function PreparePreview() {
  const formats = ['CSV', 'XLSX', 'XLS'];

  return (
    <View style={{ gap: hp(8) }}>
      {/* 파일 드롭존 미니어처 */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: wp(10),
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.4)',
          borderStyle: 'dashed',
          padding: wp(12),
          alignItems: 'center',
          gap: hp(4),
        }}
      >
        <Ionicons name="folder-open" size={wp(28)} color="rgba(255,255,255,0.9)" />
        <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
          파일 선택
        </Text>
        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.6)' }}>
          탭하여 파일을 선택하세요
        </Text>
      </View>

      {/* 지원 포맷 뱃지 */}
      <View style={{ flexDirection: 'row', gap: wp(4), justifyContent: 'center' }}>
        {formats.map((fmt) => (
          <View
            key={fmt}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: wp(4),
              paddingHorizontal: wp(6),
              paddingVertical: hp(2),
            }}
          >
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>
              .{fmt}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * AnalyzePreview
 * 슬라이드 2: 자동 분석 결과 리스트 미니 목업
 * 자동 분류된 거래 내역 카드를 미니어처로 보여줍니다.
 */
function AnalyzePreview() {
  // 미리보기용 더미 데이터 (실제 데이터가 아닌 예시)
  const items = [
    { merchant: '스타벅스', category: '카페', classified: true },
    { merchant: '이마트', category: '식비', classified: true },
    { merchant: '알 수 없음', category: '미분류', classified: false },
  ];

  return (
    <View style={{ gap: hp(6) }}>
      {/* AI 분석 중 배지 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: wp(4),
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: wp(6),
          paddingHorizontal: wp(8),
          paddingVertical: hp(3),
          alignSelf: 'flex-start',
        }}
      >
        <Ionicons name="sparkles-outline" size={wp(10)} color="rgba(255,255,255,0.9)" />
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
          자동 분류 완료
        </Text>
      </View>

      {/* 거래 내역 미니 카드 */}
      {items.map((item) => (
        <View
          key={item.merchant}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: wp(6),
            paddingHorizontal: wp(8),
            paddingVertical: hp(4),
          }}
        >
          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
            {item.merchant}
          </Text>
          <View
            style={{
              backgroundColor: item.classified
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(255, 180, 0, 0.4)',
              borderRadius: wp(4),
              paddingHorizontal: wp(5),
              paddingVertical: hp(1),
            }}
          >
            <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.95)', fontWeight: '600' }}>
              {item.category}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * ReviewPreview
 * 슬라이드 3: 카테고리 수정 화면 미니 목업
 * 선택 가능한 카테고리 그리드와 저장 버튼을 보여줍니다.
 */
function ReviewPreview() {
  // 미리보기용 카테고리 목록
  const categories = ['식비', '카페', '교통', '쇼핑', '문화', '기타'];

  return (
    <View style={{ gap: hp(8) }}>
      {/* 안내 텍스트 */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: wp(6),
          padding: wp(8),
          flexDirection: 'row',
          alignItems: 'center',
          gap: wp(5),
        }}
      >
        <Ionicons name="create-outline" size={wp(12)} color="rgba(255,255,255,0.9)" />
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.9)' }}>
          카테고리 직접 선택
        </Text>
      </View>

      {/* 카테고리 그리드 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(4) }}>
        {categories.map((cat, index) => (
          <View
            key={cat}
            style={{
              // 첫 번째 항목을 선택된 상태로 강조해 인터랙션을 암시합니다.
              backgroundColor:
                index === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              borderRadius: wp(4),
              paddingHorizontal: wp(6),
              paddingVertical: hp(3),
            }}
          >
            <Text
              style={{
                fontSize: fp(8),
                fontWeight: '600',
                color: index === 0 ? '#5A3A7A' : 'rgba(255,255,255,0.85)',
              }}
            >
              {cat}
            </Text>
          </View>
        ))}
      </View>

      {/* 저장 버튼 미니어처 */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.25)',
          borderRadius: wp(6),
          paddingVertical: hp(5),
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.95)', fontWeight: '700' }}>
          캘린더에 저장
        </Text>
      </View>
    </View>
  );
}
