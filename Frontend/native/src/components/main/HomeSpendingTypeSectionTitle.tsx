import React from 'react';
import { Text } from 'react-native';

import { styles } from './HomeSpendingTypeSheet.styles';

type HomeSpendingTypeSectionTitleProps = {
  title: string;
};

export default function HomeSpendingTypeSectionTitle({
  title,
}: HomeSpendingTypeSectionTitleProps) {
  return <Text style={styles.sheetSectionTitle}>{title}</Text>;
}
