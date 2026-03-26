import React from 'react';
import type { ViewStyle } from 'react-native';
import DataSourceNotice from '../common/DataSourceNotice';
import type { CalendarHeaderFetchState } from '../../types/calendar';

interface CalendarTopDockNoticeProps {
  headerFetchState: CalendarHeaderFetchState;
  style?: ViewStyle;
}

export default function CalendarTopDockNotice({
  headerFetchState,
  style,
}: CalendarTopDockNoticeProps) {
  const description =
    headerFetchState === 'live'
      ? '?ã…»ëœ‘ ?ì‡°????ã…»ëœ²?ëŒ„ê½£?ë‹¿í€¬, ï§Žë¶¾ãˆ?Â€ ?ì‡°? ???ê³—ì” ??è«›?æ€¨ì¢Žì ™ï§žÂ€ç•°??ë¨®ì««?ë¨®ë’— mock ?ë¨®ë’— fallback ?ê³—ì” ?ê³Œ? ?Ñ‹ë¸¿?â‘¸ë•²??'
      : '?ê¾©ì˜± ï§¦ì„Žâ”›???ë¶¾ãˆƒ?Â€ mock ?ë¨®ë’— fallback ?ê³—ì” ?ê³Œ? ?Ñ‹ë¸¿?ì„ë¼± ?ë‰ë’¿?ëˆë–Ž.';

  return (
    <DataSourceNotice
      type={headerFetchState === 'live' ? 'mixed' : 'mock'}
      description={description}
      style={style}
    />
  );
}
