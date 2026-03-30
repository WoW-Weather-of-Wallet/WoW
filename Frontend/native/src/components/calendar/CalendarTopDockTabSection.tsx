import React from 'react';
import { View, type ViewStyle } from 'react-native';
import CalendarTabSwitcher from './CalendarTabSwitcher';

type CalendarTabKey = React.ComponentProps<typeof CalendarTabSwitcher>['activeTab'];

interface CalendarTopDockTabSectionProps {
  activeTab: CalendarTabKey;
  onChangeTab: (tab: CalendarTabKey) => void;
  style?: ViewStyle;
}

export default function CalendarTopDockTabSection({
  activeTab,
  onChangeTab,
  style,
}: CalendarTopDockTabSectionProps) {
  return (
    <View style={style}>
      <CalendarTabSwitcher activeTab={activeTab} onChange={onChangeTab} />
    </View>
  );
}
