import React from 'react';
import { Text, TouchableOpacity, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './SettingItem.styles';

interface SettingItemProps {
  label: string;
  value?: string;
  type?: 'link' | 'toggle' | 'text';
  isToggled?: boolean;
  onPress?: () => void;
  onToggle?: (val: boolean) => void;
  isDanger?: boolean;
  isDisabled?: boolean;
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
  isDisabled = false,
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
            disabled={isDisabled}
            trackColor={{ false: COLORS.switchTrackFalse, true: COLORS.primary }}
            thumbColor={COLORS.white}
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
      disabled={!onPress || isDisabled}
    >
      {content}
    </TouchableOpacity>
  );
}

