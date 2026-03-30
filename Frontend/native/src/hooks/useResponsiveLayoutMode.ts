import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { LAYOUT } from '../constants/theme';

export type ResponsiveLayoutMode = 'compact' | 'regular' | 'tall';

export function useResponsiveLayoutMode() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const safeWidth = Math.max(width, 1);
    const aspectRatio = height / safeWidth;
    const isCompact = height < 760;
    const isTall = !isCompact && (height >= 960 || aspectRatio > 2.12);
    const isNarrowWidth = width < 360;
    const mode: ResponsiveLayoutMode = isCompact ? 'compact' : isTall ? 'tall' : 'regular';

    return {
      mode,
      width,
      height,
      aspectRatio,
      isCompact,
      isTall,
      pageHorizontal: isNarrowWidth ? LAYOUT.pageHorizontalNarrow : LAYOUT.pageHorizontal,
      sectionGap: isCompact ? LAYOUT.pageSectionGapCompact : LAYOUT.pageSectionGap,
      scrollTopPadding: isCompact ? LAYOUT.scrollTopPaddingCompact : LAYOUT.scrollTopPadding,
      scrollBottomPadding: isCompact
        ? LAYOUT.scrollBottomPaddingCompact
        : LAYOUT.scrollBottomPadding,
      topDockTopPadding: isCompact
        ? LAYOUT.topDockTopPaddingCompact
        : LAYOUT.topDockTopPadding,
    };
  }, [height, width]);
}
