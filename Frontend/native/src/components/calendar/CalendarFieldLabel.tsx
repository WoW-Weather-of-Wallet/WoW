import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarAddEntrySheet.styles';

interface CalendarFieldLabelProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function CalendarFieldLabel({ label, icon }: CalendarFieldLabelProps) {
  return (
    <View style={styles.fieldLabelRow}>
      {icon ? <Ionicons name={icon} size={wp(14)} color={COLORS.primary} /> : null}
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
  );
}
