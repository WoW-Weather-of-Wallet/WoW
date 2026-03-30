import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import MemoIcon from '../../../assets/imgs/calendar/MemoIcon';

interface CalendarGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const GUIDE_SLIDES = [
  {
    key: 'overview',
    title: '캘린더 뷰와 메모 기능을\n한눈에 확인해 보세요',
    gradient: ['#4E7794', '#3A607B'],
  },
  {
    key: 'memo',
    title: '하루 내역과 메모를 함께\n기록하고 관리해 보세요',
    gradient: [COLORS.primaryLight, COLORS.primary],
  },
  {
    key: 'upload',
    title: '엑셀 또는 CSV 업로드로\n거래 내역을 빠르게 추가하세요',
    gradient: ['#83557E', '#6F3C6A'],
  },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;
const MODAL_WIDTH = SCREEN_WIDTH - wp(48);
const SLIDE_WIDTH = MODAL_WIDTH - wp(48);

export default function CalendarGuideModal({
  visible,
  onClose,
}: CalendarGuideModalProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCurrentIndex(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
  }, [visible]);

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setCurrentIndex(nextIndex);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: wp(24) }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="캘린더 가이드 닫기"
        />
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
          }}
          style={{
            width: '100%',
            backgroundColor: COLORS.white,
            borderRadius: wp(28),
            padding: wp(24),
            shadowColor: COLORS.black,
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ marginBottom: hp(16) }}
          >
            <Text
              style={{
                fontSize: fp(18),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
              }}
            >
              캘린더 가이드
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            style={{ height: hp(360) }}
            scrollEventThrottle={16}
          >
            {GUIDE_SLIDES.map((slide) => (
              <View
                key={slide.key}
                className="items-center"
                style={{ width: SLIDE_WIDTH }}
              >
                <View className="items-center" style={{ marginBottom: hp(20) }}>
                  <LinearGradient
                    colors={slide.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: wp(200),
                      height: hp(240),
                      borderRadius: wp(16),
                      padding: wp(12),
                      justifyContent: 'center',
                      overflow: 'hidden',
                      shadowColor: COLORS.black,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
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

                <Text
                  style={{
                    fontSize: fp(18),
                    fontFamily: FONTS.bold,
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

          <View className="items-center" style={{ marginTop: hp(12) }}>
            <View
              className="flex-row items-center justify-center"
              style={{ gap: wp(6), marginBottom: hp(10) }}
            >
              {GUIDE_SLIDES.map((slide, index) => (
                <View
                  key={slide.key}
                  style={{
                    width: index === currentIndex ? wp(18) : wp(6),
                    height: wp(6),
                    borderRadius: wp(3),
                    backgroundColor:
                      index === currentIndex ? COLORS.primary : COLORS.gray300,
                  }}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

function OverviewPreview() {
  const cells = ['1', '2', '3', '4', '5', '6', '7'];

  return (
    <PreviewCard>
      <View className="flex-row items-center justify-between">
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: wp(8),
            paddingVertical: hp(4),
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              fontSize: fp(10),
              fontFamily: FONTS.bold,
              color: COLORS.white,
            }}
          >
            캘린더 뷰
          </Text>
        </View>
        <View
          className="items-center justify-center"
          style={{
            width: wp(20),
            height: wp(20),
            borderRadius: wp(10),
            backgroundColor: COLORS.backgroundSecondary,
          }}
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={wp(12)}
            color={COLORS.textSecondary}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, index) => (
          <View
            key={day}
            className="items-center"
            style={{
              width: '14.28%',
              justifyContent: 'flex-start',
              paddingTop: hp(4),
              height: hp(36),
              position: 'relative',
            }}
          >
            {index === 2 ? (
              <View
                style={{
                  position: 'absolute',
                  top: hp(1),
                  right: wp(3),
                  zIndex: 0,
                }}
              >
                <MemoIcon size={9} />
              </View>
            ) : null}
            <Text
              style={{
                fontSize: fp(9),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                height: hp(12),
                lineHeight: hp(12),
                textAlign: 'center',
                zIndex: 1,
              }}
            >
              {day}
            </Text>
            <Text
              style={{
                marginTop: hp(3),
                fontSize: fp(6.5),
                fontFamily: FONTS.medium,
                color: COLORS.spentRed,
                height: hp(10),
                lineHeight: hp(10),
                textAlign: 'center',
                letterSpacing: -0.3,
              }}
            >
              {index % 2 === 0 ? '12,000' : '-'}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: wp(8),
            paddingVertical: hp(4),
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.primary50,
          }}
        >
          <Text
            style={{
              fontSize: fp(10),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
            }}
          >
            거래 내역
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={wp(12)} color={COLORS.textSecondary} />
      </View>
    </PreviewCard>
  );
}

function MemoPreview() {
  return (
    <PreviewCard>
      <View
        style={{
          width: '100%',
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.primary50,
          padding: wp(10),
          gap: hp(6),
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text
            style={{
              fontSize: fp(10),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            6월 12일 (수)
          </Text>
          <MemoIcon size={12} />
        </View>
        <Text
          style={{
            fontSize: fp(9),
            fontFamily: FONTS.medium,
            color: COLORS.textSecondary,
            lineHeight: fp(14),
          }}
        >
          오늘은 점심 약속과 커피 지출이 있었어요.
        </Text>
      </View>

      <View className="flex-row" style={{ width: '100%', gap: wp(6) }}>
        <MetricCard label="지출액" value="- 27,100원" />
        <MetricCard label="건수" value="6건" />
      </View>

      <MemoField
        title="메모"
        body="중요한 지출이나 반복되는 소비 패턴을 메모해두면 월간 회고 때 더 쉽게 확인할 수 있어요."
      />
    </PreviewCard>
  );
}

function UploadPreview() {
  return (
    <PreviewCard>
      <View className="flex-row" style={{ width: '100%', gap: wp(8) }}>
        <MethodChip label="직접 입력" active />
        <MethodChip label="CSV 업로드" />
      </View>

      <MemoField
        title="지원 파일 형식"
        body="거래일, 상호명, 금액, 결제수단과 카테고리 정보를 포함한 파일을 업로드할 수 있어요."
      />

      <View
        className="items-center justify-center"
        style={{
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: COLORS.uploadBoxBorder,
          backgroundColor: COLORS.uploadBoxBackground,
          paddingVertical: hp(8),
          gap: hp(4),
        }}
      >
        <Ionicons name="cloud-upload-outline" size={wp(20)} color={COLORS.primary} />
        <Text
          style={{
            fontSize: fp(10),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          파일을 여기에 올려보세요
        </Text>
        <Text
          style={{
            fontSize: fp(8),
            fontFamily: FONTS.medium,
            color: COLORS.textSecondary,
          }}
        >
          CSV나 엑셀 파일을 선택하면 거래 내역을 분석해드려요.
        </Text>
      </View>
    </PreviewCard>
  );
}

function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.lg,
        padding: wp(10),
        gap: hp(6),
      }}
    >
      {children}
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-1"
      style={{
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
        paddingVertical: hp(8),
        paddingHorizontal: wp(8),
        gap: hp(4),
      }}
    >
      <Text
        style={{
          fontSize: fp(9),
          fontFamily: FONTS.medium,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: fp(11),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MemoField({ title, body }: { title: string; body: string }) {
  return (
    <View
      style={{
        width: '100%',
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: wp(10),
        gap: hp(4),
      }}
    >
      <Text
        style={{
          fontSize: fp(10),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: fp(9),
          fontFamily: FONTS.medium,
          color: COLORS.textSecondary,
          lineHeight: fp(14),
        }}
      >
        {body}
      </Text>
    </View>
  );
}

function MethodChip({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        borderRadius: RADIUS.lg,
        paddingVertical: hp(8),
        backgroundColor: active ? COLORS.primary : COLORS.backgroundSecondary,
        borderWidth: 1,
        borderColor: active ? COLORS.primary : COLORS.border,
      }}
    >
      <Text
        style={{
          fontSize: fp(10),
          fontFamily: FONTS.bold,
          color: active ? COLORS.white : COLORS.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
