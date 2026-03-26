import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './HomeSpendingTypeSheet.styles';

interface HomeSpendingTypeIntroCardProps {
  description: string;
}

export default function HomeSpendingTypeIntroCard({
  description,
}: HomeSpendingTypeIntroCardProps) {
  return (
    <View style={styles.introBox}>
      <Text style={styles.introText}>{description}</Text>
    </View>
  );
}
