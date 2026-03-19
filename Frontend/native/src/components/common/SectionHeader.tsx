import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './SectionHeader.styles';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
}

/**
 * SectionHeader
 * 리스트/카드 섹션 상단의 제목과 보조 액션을 동일한 톤으로 보여줍니다.
 */
export default function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

