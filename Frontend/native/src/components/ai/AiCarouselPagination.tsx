import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
    <View className="flex-row items-center justify-center" style={{ marginBottom: hp(30) }}>
      {Array.from({ length: pageCount }).map((_, index) => (
        <TouchableOpacity
          key={`ai-pagination-${index}`}
          onPress={() => onPressPage(index)}
          style={{
            width: index === activeIndex ? wp(20) : wp(8),
            height: wp(8),
            borderRadius: wp(4),
            backgroundColor: index === activeIndex ? COLORS.primary : 'rgba(0, 0, 0, 0.1)',
            marginHorizontal: wp(5),
          }}
        />
      ))}
    </View>
  );
}
