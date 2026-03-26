import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS, hp, wp } from '../../constants/theme';

interface AiCarouselPaginationProps {
  pageCount: number;
  activeIndex: number;
  onPressPage: (index: number) => void;
}

export default function AiCarouselPagination({
  pageCount,
  activeIndex,
  onPressPage,
}: AiCarouselPaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: pageCount }).map((_, index) => (
        <TouchableOpacity
          key={`ai-pagination-${index}`}
          onPress={() => onPressPage(index)}
          style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(30),
  },
  dot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: wp(5),
  },
  dotActive: {
    width: wp(20),
    backgroundColor: COLORS.primary,
  },
});
