import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

type EntryMode = 'direct' | 'excel';

const ENTRY_MODES: Array<{
  key: EntryMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'direct', label: '직접 입력', icon: 'create-outline' },
  { key: 'excel', label: '파일 업로드', icon: 'folder-open-outline' },
];

const activeModeButtonStyle = {
  backgroundColor: COLORS.white,
  shadowColor: '#2E245A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 2,
};

interface CalendarEntryModeToggleProps {
  activeMode: EntryMode;
  onChangeMode: (mode: EntryMode) => void;
}

export default function CalendarEntryModeToggle({
  activeMode,
  onChangeMode,
}: CalendarEntryModeToggleProps) {
  return (
    <View
      className="flex-row"
      style={{
        backgroundColor: COLORS.addEntryTabBackground,
        borderRadius: RADIUS.xl,
        padding: wp(4),
        marginBottom: hp(18),
      }}
    >
      {ENTRY_MODES.map((mode) => {
        const isActive = activeMode === mode.key;

        return (
          <TouchableOpacity
            key={mode.key}
            activeOpacity={0.88}
            className="flex-1 flex-row items-center justify-center"
            style={[
              {
                gap: wp(6),
                paddingVertical: hp(12),
                borderRadius: RADIUS.lg,
              },
              isActive && activeModeButtonStyle,
            ]}
            onPress={() => onChangeMode(mode.key)}
          >
            <Ionicons
              name={mode.icon}
              size={wp(16)}
              color={isActive ? COLORS.primary : COLORS.textTertiary}
            />
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: isActive ? COLORS.primary : COLORS.textSecondary,
              }}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
