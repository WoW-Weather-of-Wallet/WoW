import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { SPENDING_STYLES } from '../../constants/main/spendingStyle';
import { styles } from './SpendingStyleGuideModal.styles';

interface SpendingStyleGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - wp(40); // 너비를 약간 넓혀서 여유 공간 확보

const INTRO_TEXT = '평소 자주 지출하는 #태그를 바탕으로 AI가 정의한 8가지 소비 유형 가이드입니다. 당신의 지출 패턴이 어떤 유형에 해당하는지 한눈에 살펴보세요.';

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
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Unified Magazine Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.modalTitle}>소비 유형 가이드</Text>
              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={wp(22)} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubTitle}>
              평소 자주 지출하는 <Text style={styles.emphasizedText}>#태그</Text>를 바탕으로 AI가 정의한 8가지 소비 유형 가이드입니다. 당신의 지출 패턴이 어떤 유형에 해당하는지 한눈에 살펴보세요.
            </Text>
          </View>

          {/* Content (Horizontal Scroll) */}
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
            {SPENDING_STYLES.map((style) => (
              <View key={style.id} style={styles.slide}>
                <View style={[styles.iconContainer, { backgroundColor: style.color + '15' }]}>
                  {style.iconType === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={style.iconName as any} size={wp(64)} color={style.color} />
                  ) : (
                    <Ionicons name={style.iconName as any} size={wp(64)} color={style.color} />
                  )}
                </View>
                <Text style={styles.styleTitle}>{style.title}</Text>
                
                {style.id === 7 ? (
                  <Text style={styles.styleDescription}>
                    어느 한 카테고리에 치우치지 않고 <Text style={styles.emphasizedText}>모든 분야에서</Text> 균형 있게 소비하는 안정적인 스타일이에요.
                  </Text>
                ) : style.description ? (
                  <Text style={styles.styleDescription}>{style.description}</Text>
                ) : (
                  <View style={styles.tagContainer}>
                    <View style={styles.tagRow}>
                      {style.hashtags?.slice(0, 2).map((tag, idx) => (
                        <View key={idx} style={styles.tagBadge}>
                          <Text style={[styles.tagText, { color: style.color }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.tagRow}>
                      {style.hashtags?.slice(2, 3).map((tag, idx) => (
                        <View key={idx} style={styles.tagBadge}>
                          <Text style={[styles.tagText, { color: style.color }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Footer (Pagination) */}
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {SPENDING_STYLES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
