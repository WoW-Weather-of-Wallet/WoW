import React from 'react';
import { View, type ViewStyle } from 'react-native';
import DataSourceNotice from '../common/DataSourceNotice';
import type { CalendarOverview } from '../../mock/calendar';
import type { CalendarHeaderFetchState } from '../../types/calendar';
import CalendarHeroCard from './CalendarHeroCard';
import CalendarTabSwitcher from './CalendarTabSwitcher';

type CalendarTabKey = React.ComponentProps<typeof CalendarTabSwitcher>['activeTab'];

interface CalendarTopDockContentProps {
  overview: CalendarOverview;
  monthLabel: string;
  weatherIconName: React.ComponentProps<typeof CalendarHeroCard>['weatherIconName'];
  headerFetchState: CalendarHeaderFetchState;
  headerErrorMessage: string | null;
  activeTab: CalendarTabKey;
  onChangeTab: (tab: CalendarTabKey) => void;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressAdd: () => void;
  onPressInfo: () => void;
  showDataSourceNotice?: boolean;
  noticeStyle?: ViewStyle;
  tabWrapStyle?: ViewStyle;
}

export default function CalendarTopDockContent({
  overview,
  monthLabel,
  weatherIconName,
  headerFetchState,
  headerErrorMessage,
  activeTab,
  onChangeTab,
  onPressPrevMonth,
  onPressNextMonth,
  onPressAdd,
  onPressInfo,
  showDataSourceNotice = false,
  noticeStyle,
  tabWrapStyle,
}: CalendarTopDockContentProps) {
  const noticeDescription =
    headerFetchState === 'live'
      ? '헤더 일부는 실데이터이고, 메모와 일부 월 데이터 및 고정지출 흐름에는 mock 또는 fallback 데이터가 포함됩니다.'
      : '현재 캘린더 화면은 mock 또는 fallback 데이터가 포함되어 있습니다.';

  return (
    <>
      {showDataSourceNotice ? (
        <DataSourceNotice
          type={headerFetchState === 'live' ? 'mixed' : 'mock'}
          description={noticeDescription}
          style={noticeStyle}
        />
      ) : null}

      <CalendarHeroCard
        overview={overview}
        monthLabel={monthLabel}
        weatherIconName={weatherIconName}
        headerFetchState={headerFetchState}
        headerErrorMessage={headerErrorMessage}
        onPressPrevMonth={onPressPrevMonth}
        onPressNextMonth={onPressNextMonth}
        onPressAdd={onPressAdd}
        onPressInfo={onPressInfo}
      />

      <View style={tabWrapStyle}>
        <CalendarTabSwitcher activeTab={activeTab} onChange={onChangeTab} />
      </View>
    </>
  );
}
