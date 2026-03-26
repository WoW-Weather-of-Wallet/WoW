import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';

interface CalendarHeroWeatherCardProps {
  weatherIconName: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
}

export default function CalendarHeroWeatherCard({
  weatherIconName,
  title,
  hint,
}: CalendarHeroWeatherCardProps) {
  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherIconWrap}>
        <Ionicons name={weatherIconName} size={wp(25)} color={COLORS.weatherSun} />
      </View>
      <View style={styles.weatherTextBlock}>
        <Text style={styles.weatherTitle}>{title}</Text>
        <Text style={styles.weatherHint}>{hint}</Text>
      </View>
    </View>
  );
}
