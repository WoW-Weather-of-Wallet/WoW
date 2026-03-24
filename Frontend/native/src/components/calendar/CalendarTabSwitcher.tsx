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

/**
 * 캘린더 / 전체내역 전환 탭.
 * 공통 탭 구조는 유지하되, 와이어프레임처럼 현재 탭이 더 분명히 보이도록 톤을 고정한다.
 */
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
    backgroundColor: '#F3F2FB',
    borderRadius: RADIUS.xl,
    padding: wp(4),
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
    paddingVertical: hp(12),
    borderRadius: RADIUS.lg,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
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
