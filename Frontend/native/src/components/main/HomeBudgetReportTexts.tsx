import React from 'react';
import { Text } from 'react-native';
import { styles } from './HomeBudgetReportCard.styles';

interface HomeBudgetReportTextsProps {
  helperMessage: string;
  forecastMessage: string;
}

export default function HomeBudgetReportTexts({
  helperMessage,
  forecastMessage,
}: HomeBudgetReportTextsProps) {
  return (
    <>
      <Text style={styles.helperText}>{helperMessage}</Text>
      <Text style={styles.forecastText}>{forecastMessage}</Text>
    </>
  );
}
