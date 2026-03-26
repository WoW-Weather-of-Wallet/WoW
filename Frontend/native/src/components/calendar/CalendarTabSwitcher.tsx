import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
    <View
      className="flex-row"
      style={{
        backgroundColor: COLORS.tabSwitcherBackground,
        borderRadius: RADIUS.xl,
        padding: wp(4),
      }}
    >
      {CALENDAR_TAB_OPTIONS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.88}
            className="flex-1 flex-row items-center justify-center"
            style={{
              gap: wp(6),
              paddingVertical: hp(12),
              borderRadius: RADIUS.lg,
              backgroundColor: isActive ? COLORS.primary : 'transparent',
              shadowColor: isActive ? COLORS.primary : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.16 : 0,
              shadowRadius: isActive ? 10 : 0,
              elevation: isActive ? 3 : 0,
            }}
            onPress={() => onChange(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={wp(15)}
              color={isActive ? COLORS.textInverse : COLORS.textSecondary}
            />
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: isActive ? COLORS.textInverse : COLORS.textSecondary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
