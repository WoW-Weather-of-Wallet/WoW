import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainTabNavigationProp, MainTabRouteProp } from '../types';
import { useCalendarMockState } from './useCalendarMockState';

export function useCalendarScreenFlow() {
  const [isGuideVisible, setIsGuideVisible] = React.useState(false);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = React.useState(false);
  const route = useRoute<MainTabRouteProp<'Calendar'>>();
  const navigation = useNavigation<MainTabNavigationProp<'Calendar'>>();
  const calendarState = useCalendarMockState();

  React.useEffect(() => {
    if (route.params?.action === 'add_record') {
      calendarState.setIsAddEntryVisible(true);
      navigation.setParams({ action: undefined });
    }
  }, [calendarState.setIsAddEntryVisible, navigation, route.params?.action]);

  const handleOpenGuide = React.useCallback(() => {
    setIsGuideVisible(true);
  }, []);

  const handleCloseGuide = React.useCallback(() => {
    setIsGuideVisible(false);
  }, []);

  const handleOpenAddEntry = React.useCallback(() => {
    calendarState.setIsAddEntryVisible(true);
  }, [calendarState.setIsAddEntryVisible]);

  const handleOpenMonthPicker = React.useCallback(() => {
    setIsMonthPickerVisible(true);
  }, []);

  const handleCloseMonthPicker = React.useCallback(() => {
    setIsMonthPickerVisible(false);
  }, []);

  const handleSelectCalendarDate = React.useCallback((dateKey: string) => {
    calendarState.handleJumpToDate(dateKey);
    setIsMonthPickerVisible(false);
  }, [calendarState.handleJumpToDate]);

  return {
    ...calendarState,
    isGuideVisible,
    isMonthPickerVisible,
    calendarPickerDateKey: calendarState.selectedDateKey ?? calendarState.defaultAddEntryDateKey,
    handleOpenGuide,
    handleCloseGuide,
    handleOpenAddEntry,
    handleOpenMonthPicker,
    handleCloseMonthPicker,
    handleSelectCalendarDate,
  };
}
