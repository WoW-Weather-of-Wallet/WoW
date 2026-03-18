import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CALENDAR_TAB_OPTIONS } from '../../constants/calendar/ui';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarTabSwitcher.styles';

type CalendarTabKey = (typeof CALENDAR_TAB_OPTIONS)[number]['key'];

interface CalendarTabSwitcherProps {
  activeTab: CalendarTabKey;
  onChange: (tab: CalendarTabKey) => void;
}

export default function CalendarTabSwitcher({
  activeTab,
  onChange,
}: CalendarTabSwitcherProps) {
  return (
    <View style={styles.tabSwitcher}>
      {CALENDAR_TAB_OPTIONS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.88}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onChange(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={wp(15)}
              color={isActive ? COLORS.textInverse : COLORS.textSecondary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

