import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';

interface CalendarHeroHeaderProps {
  title: string;
  addLabel: string;
  onPressAdd?: () => void;
  onPressInfo?: () => void;
}

export default function CalendarHeroHeader({
  title,
  addLabel,
  onPressAdd,
  onPressInfo,
}: CalendarHeroHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.titleWrap}>
        <Text style={styles.screenTitle}>{title}</Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.infoButton} onPress={onPressInfo}>
          <Ionicons name="information-circle-outline" size={wp(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity activeOpacity={0.9} style={styles.addButton} onPress={onPressAdd}>
        <Text style={styles.addButtonText}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
