import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { hp, LAYOUT, wp } from '../constants/theme';

export type ResponsiveLayoutMode = 'compact' | 'regular' | 'tall';

export function useResponsiveLayoutMode() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const safeWidth = Math.max(width, 1);
    const aspectRatio = height / safeWidth;
    const isCompact = height < 760;
    const isTall = !isCompact && (height >= 900 || aspectRatio > 2.05);
    const isNarrowWidth = width < 360;
    const mode: ResponsiveLayoutMode = isCompact ? 'compact' : isTall ? 'tall' : 'regular';

    return {
      mode,
      width,
      height,
      aspectRatio,
      isCompact,
      isTall,
      pageHorizontal: isNarrowWidth ? wp(16) : LAYOUT.pageHorizontal,
      sectionGap: isCompact ? hp(14) : isTall ? hp(20) : LAYOUT.pageSectionGap,
      scrollTopPadding: isCompact ? hp(10) : isTall ? hp(16) : hp(12),
      scrollBottomPadding: isCompact ? hp(24) : isTall ? hp(34) : hp(30),
      topDockTopPadding: isCompact ? hp(10) : isTall ? hp(14) : hp(12),
    };
  }, [height, width]);
}
