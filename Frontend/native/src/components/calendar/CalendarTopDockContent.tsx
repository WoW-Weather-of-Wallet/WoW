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
  weatherIconCode: React.ComponentProps<typeof CalendarHeroCard>['weatherIconCode'];
  headerFetchState: CalendarHeaderFetchState;
  headerErrorMessage: string | null;
  activeTab: CalendarTabKey;
  onChangeTab: (tab: CalendarTabKey) => void;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressMonthLabel?: () => void;
  onPressAdd: () => void;
  onPressInfo: () => void;
  showDataSourceNotice?: boolean;
  noticeStyle?: ViewStyle;
  tabWrapStyle?: ViewStyle;
}

export default function CalendarTopDockContent({
  overview,
  monthLabel,
  weatherIconCode,
  headerFetchState,
  headerErrorMessage,
  activeTab,
  onChangeTab,
  onPressPrevMonth,
  onPressNextMonth,
  onPressMonthLabel,
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
        weatherIconCode={weatherIconCode}
        headerFetchState={headerFetchState}
        headerErrorMessage={headerErrorMessage}
        onPressPrevMonth={onPressPrevMonth}
        onPressNextMonth={onPressNextMonth}
        onPressMonthLabel={onPressMonthLabel}
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
