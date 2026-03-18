import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CALENDAR_TAB_OPTIONS } from '../../constants/calendar/ui';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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

const styles = StyleSheet.create({
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F5F4FA',
    borderRadius: RADIUS.xl,
    padding: wp(4),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    paddingVertical: hp(12),
    borderRadius: RADIUS.lg,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  tabLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.textInverse,
  },
});
