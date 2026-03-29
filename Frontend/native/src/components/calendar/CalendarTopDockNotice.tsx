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
      ? '실시간 데이터와 저장된 정보를 함께 반영했어요. 일부 항목은 보정 데이터가 함께 표시될 수 있어요.'
      : '실시간 연결이 잠시 지연되어 저장된 데이터 기준으로 내용을 보여드리고 있어요.';

  return (
    <DataSourceNotice
      type={headerFetchState === 'live' ? 'mixed' : 'mock'}
      description={description}
      style={style}
    />
  );
}
