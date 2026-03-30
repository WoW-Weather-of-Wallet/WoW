import { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

interface UseAiFeatureCarouselOptions {
  itemWidth: number;
}

export function useAiFeatureCarousel({ itemWidth }: UseAiFeatureCarouselOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(scrollOffset / itemWidth);

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const scrollToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * itemWidth, animated: true });
    setActiveIndex(index);
  };

  return {
    activeIndex,
    scrollRef,
    handleScroll,
    scrollToPage,
  };
}
