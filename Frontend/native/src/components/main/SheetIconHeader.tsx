import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './SheetIconHeader.styles';

interface SheetIconHeaderProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  title: string;
}

/**
 * 메인 홈 바텀시트 상단에서 공통으로 쓰는 아이콘 헤더.
 * 아이콘과 타이틀 톤을 고정해 시트마다 문구만 바꿔 재사용한다.
 */
export default function SheetIconHeader({
  iconName,
  eyebrow,
  title,
}: SheetIconHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={wp(26)} color={COLORS.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

