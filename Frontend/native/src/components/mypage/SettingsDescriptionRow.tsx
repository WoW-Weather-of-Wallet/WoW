import React from 'react';
import { Switch, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface SettingsDescriptionRowProps {
  description: string;
  switchValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

export default function SettingsDescriptionRow({
  description,
  switchValue,
  onToggle,
  disabled = false,
}: SettingsDescriptionRowProps) {
  const hasSwitch = typeof switchValue === 'boolean' && Boolean(onToggle);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(20),
        paddingBottom: hp(16),
        backgroundColor: COLORS.background,
        gap: wp(12),
      }}
    >
      <Text
        style={{
          flex: 1,
          fontSize: fp(12),
          lineHeight: fp(18),
          fontFamily: FONTS.medium,
          color: COLORS.textSecondary,
        }}
      >
        {description}
      </Text>

      {hasSwitch ? (
        <Switch
          value={switchValue}
          disabled={disabled}
          onValueChange={onToggle}
          thumbColor={COLORS.textInverse}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
        />
      ) : null}
    </View>
  );
}
