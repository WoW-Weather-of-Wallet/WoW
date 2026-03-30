import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { SPENDING_STYLES } from '../../constants/main/spendingStyle';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';
import SpendingStyleGuideHeader from './SpendingStyleGuideHeader';
import SpendingStyleGuidePagination from './SpendingStyleGuidePagination';
import SpendingStyleGuideSlide from './SpendingStyleGuideSlide';

interface SpendingStyleGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - wp(40);

export default function SpendingStyleGuideModal({
  visible,
  onClose,
}: SpendingStyleGuideModalProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setCurrentIndex(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
  }, [visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / CARD_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const containerStyle = {
    width: CARD_WIDTH,
    maxWidth: 420,
    borderRadius: RADIUS.xxl,
    paddingBottom: hp(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  } as const;

  const footerStyle = {
    marginTop: hp(12),
  } as const;

  const emphasizedTextStyle = {
    color: COLORS.primary,
    fontWeight: '700' as const,
  } as const;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/45">
        <View className="self-center overflow-hidden bg-white" style={containerStyle}>
          <SpendingStyleGuideHeader
            title="소비 유형 가이드"
            subtitle={
              <>
                최근 소비 패턴을 바탕으로 자주 나타나는 특징을 정리한 가이드예요.{' '}
                <Text style={emphasizedTextStyle}>#유형은 참고용</Text>이며, AI가 소비 흐름을
                이해하기 쉽게 보여주기 위한 설명 카드라고 생각하시면 됩니다.
              </>
            }
            onClose={onClose}
          />

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH}
            snapToAlignment="center"
          >
            {SPENDING_STYLES.map(styleItem => (
              <SpendingStyleGuideSlide key={styleItem.id} styleItem={styleItem} />
            ))}
          </ScrollView>

          <View className="items-center" style={footerStyle}>
            <SpendingStyleGuidePagination
              totalCount={SPENDING_STYLES.length}
              currentIndex={currentIndex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
