import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        const content = (
          <>
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
          </>
        );

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.88}
            className="flex-1"
            style={{
              borderRadius: RADIUS.lg,
              shadowColor: isActive ? COLORS.primary : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isActive ? 0.16 : 0,
              shadowRadius: isActive ? 10 : 0,
              elevation: isActive ? 3 : 0,
              overflow: 'hidden',
            }}
            onPress={() => onChange(tab.key)}
          >
            {isActive ? (
              <LinearGradient
                colors={[COLORS.primaryLight, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: wp(6),
                  paddingVertical: hp(12),
                  borderRadius: RADIUS.lg,
                }}
              >
                {content}
              </LinearGradient>
            ) : (
              <View
                className="flex-row items-center justify-center"
                style={{
                  gap: wp(6),
                  paddingVertical: hp(12),
                  borderRadius: RADIUS.lg,
                }}
              >
                {content}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
