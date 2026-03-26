import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarAddEntrySheet.styles';

type EntryMode = 'direct' | 'excel';

const ENTRY_MODES: Array<{
  key: EntryMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'direct', label: '직접 입력', icon: 'create-outline' },
  { key: 'excel', label: '파일 업로드', icon: 'folder-open-outline' },
];

interface CalendarEntryModeToggleProps {
  activeMode: EntryMode;
  onChangeMode: (mode: EntryMode) => void;
}

export default function CalendarEntryModeToggle({
  activeMode,
  onChangeMode,
}: CalendarEntryModeToggleProps) {
  return (
    <View style={styles.modeRow}>
      {ENTRY_MODES.map((mode) => {
        const isActive = activeMode === mode.key;

        return (
          <TouchableOpacity
            key={mode.key}
            activeOpacity={0.88}
            style={[styles.modeButton, isActive && styles.modeButtonActive]}
            onPress={() => onChangeMode(mode.key)}
          >
            <Ionicons
              name={mode.icon}
              size={wp(16)}
              color={isActive ? COLORS.primary : COLORS.textTertiary}
            />
            <Text style={[styles.modeText, isActive && styles.modeTextActive]}>{mode.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
