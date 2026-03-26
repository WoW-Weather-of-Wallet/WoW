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
      ? '실시간 데이터와 저장된 정보를 함께 반영한 화면입니다. 일부 항목은 mock 또는 fallback 데이터가 함께 보일 수 있어요.'
      : '현재 실시간 데이터를 불러오지 못해 mock 또는 fallback 데이터로 내용을 보여드리고 있습니다.';

  return (
    <DataSourceNotice
      type={headerFetchState === 'live' ? 'mixed' : 'mock'}
      description={description}
      style={style}
    />
  );
}
