import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, wp } from '../../constants/theme';

interface CalendarFieldLabelProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function CalendarFieldLabel({ label, icon }: CalendarFieldLabelProps) {
  return (
    <View className="flex-row items-center" style={{ gap: wp(6) }}>
      {icon ? <Ionicons name={icon} size={wp(14)} color={COLORS.primary} /> : null}
      <Text
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.bold,
          color: COLORS.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
