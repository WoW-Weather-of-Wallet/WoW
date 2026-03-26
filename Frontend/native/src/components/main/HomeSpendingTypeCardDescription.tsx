import React from 'react';
import { Text } from 'react-native';
import { styles } from './HomeSpendingTypeCard.styles';

interface HomeSpendingTypeCardDescriptionProps {
  description: string;
}

export default function HomeSpendingTypeCardDescription({
  description,
}: HomeSpendingTypeCardDescriptionProps) {
  return <Text style={styles.description}>{description}</Text>;
}
