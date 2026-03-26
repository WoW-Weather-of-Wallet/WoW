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
  onClose: () => void;
}

// ─── 슬라이드 데이터 ───────────────────────────────────────────────────────────
const GUIDE_SLIDES = [
  {
    key: 'prepare',
    title: '은행·카드 내역 파일을\n미리 준비해 주세요',
    description:
      '은행이나 카드 앱에서 CSV 또는 엑셀(.xlsx) 형식으로 내역을 내려받아 주세요. 삼성카드, 신한카드, 국민은행 등 주요 포맷을 지원합니다.',
    // 슬라이드마다 그라디언트 색상을 다르게 하여 시각적 다양성을 줍니다.
    gradient: ['#4E7794', '#3A607B'] as [string, string],
  },
  {
    key: 'analyze',
    title: '업로드하면 자동으로\n분류해 드려요',
    description:
      '파일을 선택하면 AI가 거래 내역을 자동으로 분석하고 카테고리를 분류해 드려요. 분류 결과는 미리보기로 바로 확인할 수 있습니다.',
    gradient: ['#6B67A7', '#4E4E96'] as [string, string],
  },
  {
    key: 'review',
    title: '분류가 어긋난 항목은\n직접 수정할 수 있어요',
    description:
      '자동 분류가 애매한 항목은 직접 카테고리를 선택해 수정해 주세요. 모든 항목이 정리되면 캘린더에 한 번에 저장할 수 있습니다.',
    gradient: ['#83557E', '#6F3C6A'] as [string, string],
  },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;
const MODAL_WIDTH = SCREEN_WIDTH - wp(48); // [UX-Fix] 소비날씨 모달과 동일한 너비 확보 (좌우 p-6 여백 고려)

export default function ExcelUploadGuideModal({
  visible,
  onClose,
}: ExcelUploadGuideModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);

  // 현재 표시 중인 슬라이드 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);

  // 모달이 열릴 때마다 첫 슬라이드로 초기화합니다.
  useEffect(() => {
    if (!visible) {
      return;
    }
    setCurrentIndex(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
  }, [visible]);

  const isLastSlide = currentIndex === GUIDE_SLIDES.length - 1;

  // 가로 스크롤이 멈췄을 때 현재 인덱스를 계산합니다.
  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / MODAL_WIDTH, // SCREEN_WIDTH 대신 MODAL_WIDTH 기준
    );
    setCurrentIndex(nextIndex);
  }

  // '다음' 버튼이 제거되었으므로 handleNext는 불필요하지만 로직상 유지하거나 제거 가능
  // 여기서는 스와이프 위주의 조작계로 변경되므로 scrollTo 로직을 업데이트합니다.
  function handleManualScroll(index: number) {
    scrollRef.current?.scrollTo({
      x: MODAL_WIDTH * index,
      animated: true,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => onClose()}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: wp(24),
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderRadius: wp(28),
            padding: wp(24),
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* ── 헤더 (X 닫기 버튼 포함) ── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: hp(16),
            }}
          >
            <Text
              style={{
                fontSize: fp(18),
                fontWeight: '700',
                color: COLORS.textPrimary,
              }}
            >
              파일 업로드 가이드
            </Text>
            <TouchableOpacity
              activeOpacity={0.86}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => onClose()}
            >
              <Ionicons name="close" size={wp(22)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* ── 슬라이드 페이저 (압축 구역) ── */}
          <View style={{ height: hp(260) }}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumEnd}
              scrollEventThrottle={16}
            >
              {GUIDE_SLIDES.map((slide) => (
                <View
                  key={slide.key}
                  style={{ width: MODAL_WIDTH - wp(48), alignItems: 'center' }}
                >
                  {/* 미니 목업 미리보기 영역 (압축) */}
                  <View style={{ marginBottom: hp(20) }}>
                    <LinearGradient
                      colors={slide.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: wp(200),
                        height: hp(140),
                        borderRadius: wp(16),
                        padding: wp(12),
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 4,
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

                  {/* 슬라이드 텍스트: 설명글은 제거하고 제목만 남김 */}
                  <Text
                    style={{
                      fontSize: fp(18),
                      fontWeight: '700',
                      color: COLORS.textPrimary,
                      lineHeight: fp(24),
                      textAlign: 'center',
                    }}
                  >
                    {slide.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── 푸터 (인디케이터, 다시 보지 않기 - 다음 버튼 제거됨) ── */}
          <View
            style={{
              marginTop: hp(12),
              gap: hp(16),
              alignItems: 'center',
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
                    backgroundColor: index === currentIndex ? COLORS.primary : COLORS.border,
                  }}
                />
              ))}
            </View>

            {/* 다시 보지 않기 섹션 제거 */}
          </View>
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
