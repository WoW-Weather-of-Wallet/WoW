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
import { wp } from '../../constants/theme';
import { styles } from './SpendingStyleGuideModal.styles';
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <SpendingStyleGuideHeader
            title="?ëš®í‰¬ ?ì¢ì‚Ž åª›Â€?ëŒ€ë±¶"
            subtitle={
              <>
                ?ë±ëƒ¼ ?ë¨¯ï¼œ ï§žÂ€ç•°ì’—ë¸¯??
                <Text style={styles.emphasizedText}>#?ì’“ë ‡</Text>
                ç‘œ?è«›ë·€ê¹¢?ì‡°ì¤ˆ AIåª›Â€ ?ëº¤ì“½??8åª›Â€ï§žÂ€
                ?ëš®í‰¬ ?ì¢ì‚Ž åª›Â€?ëŒ€ë±¶?ë‚…ë•²?? ?ë±€ë–Š??ï§žÂ€ç•°??â‘¦ê½©???
                ëŒ€ë¼¡ ?ì¢ì‚Ž???ëŒ€ë–¦?ì„Žë’—ï§žÂ€ ?ì’•ëŠ¿???ëŒ„ë £è¹‚ëŒê½­??
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

          <View style={styles.footer}>
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
