import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface SettingItemProps {
  label: string;
  value?: string;
  type?: 'link' | 'toggle' | 'text';
  isToggled?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
  isDanger?: boolean;
}

/**
 * 설정 페이지의 각 항목을 담당하는 범용 컴포넌트입니다.
 * 링크, 토글, 텍스트 표시 등 다양한 타입을 지원합니다.
 */
export default function SettingItem({
  label,
  value,
  type = 'link',
  isToggled = false,
  onPress,
  onToggle,
  isDanger = false,
}: SettingItemProps) {
  const content = (
    <View style={styles.container}>
      <Text style={[styles.label, isDanger && styles.dangerLabel]}>{label}</Text>
      
      <View style={styles.rightContent}>
        {value && <Text style={styles.valueText}>{value}</Text>}
        
        {type === 'link' && (
          <Ionicons 
            name="chevron-forward" 
            size={wp(18)} 
            color={COLORS.textTertiary} 
            style={styles.chevron}
          />
        )}
        
        {type === 'toggle' && (
          <Switch
            value={isToggled}
            onValueChange={onToggle}
            trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        )}
      </View>
    </View>
  );

  if (type === 'toggle') {
    return <View>{content}</View>;
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.6} 
      onPress={onPress}
      disabled={!onPress}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  dangerLabel: {
    color: '#EF4444',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginRight: wp(4),
  },
  chevron: {
    marginLeft: wp(4),
  },
});
