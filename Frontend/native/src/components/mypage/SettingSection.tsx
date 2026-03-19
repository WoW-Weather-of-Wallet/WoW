import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './SettingSection.styles';

interface SettingSectionProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * 설정 항목들을 논리적인 그룹으로 묶어주는 섹션 컴포넌트입니다.
 */
export default function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

