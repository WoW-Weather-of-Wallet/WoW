import React from 'react';
import type { ViewStyle } from 'react-native';
import type { CalendarOverview } from '../../mock/calendar';
import type { CalendarHeaderFetchState } from '../../types/calendar';
import CalendarHeroCard from './CalendarHeroCard';
import CalendarTabSwitcher from './CalendarTabSwitcher';
import CalendarTopDockNotice from './CalendarTopDockNotice';
import CalendarTopDockTabSection from './CalendarTopDockTabSection';

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
  return (
    <>
      {showDataSourceNotice ? (
        <CalendarTopDockNotice
          headerFetchState={headerFetchState}
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

      <CalendarTopDockTabSection
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        style={tabWrapStyle}
      />
    </>
  );
}
