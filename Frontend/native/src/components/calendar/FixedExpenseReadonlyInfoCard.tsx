import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './FixedExpenseDetailSheet.styles';

interface FixedExpenseReadonlyInfoCardProps {
  title: string;
  category: string;
}

export default function FixedExpenseReadonlyInfoCard({
  title,
  category,
}: FixedExpenseReadonlyInfoCardProps) {
  return (
    <View style={styles.readonlyInfoCard}>
      <View style={styles.readonlyInfoRow}>
        <Text style={styles.readonlyLabel}>항목명</Text>
        <Text style={styles.readonlyValue}>{title}</Text>
      </View>
      <View style={styles.readonlyDivider} />
      <View style={styles.readonlyInfoRow}>
        <Text style={styles.readonlyLabel}>카테고리</Text>
        <Text style={styles.readonlyValue}>{category}</Text>
      </View>
    </View>
  );
}
