import React from 'react';
import { Platform, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fp, hp, wp } from '../../constants/theme';

export interface SettingItemProps {
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
  const rowHeight =
    Platform.OS === 'android' && type === 'toggle'
      ? hp(44)
      : hp(54);
  const rowStyle = {
    height: rowHeight,
    paddingHorizontal: wp(20),
  } as const;

  const content = (
    <View
      className="flex-row items-center justify-between bg-surface"
      style={rowStyle}
    >
      <Text
        className="font-sans-medium text-text"
        style={[{ fontSize: fp(16) }, isDanger ? { color: COLORS.limitRed } : null]}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center"
        style={{ height: rowHeight, minHeight: rowHeight }}
      >
        {value ? (
          <Text
            className="font-sans-medium text-text-tertiary"
            style={{ fontSize: fp(14), marginRight: wp(4) }}
          >
            {value}
          </Text>
        ) : null}
        
        {type === 'link' && (
          <Ionicons 
            name="chevron-forward" 
            size={wp(18)} 
            color={COLORS.textTertiary} 
            style={{ marginLeft: wp(4) }}
          />
        )}
        
        {type === 'toggle' && (
          <Switch
            value={isToggled}
            onValueChange={onToggle}
            disabled={isDisabled}
            accessibilityLabel={label}
            trackColor={{ false: COLORS.switchTrackFalse, true: COLORS.primary }}
            thumbColor={COLORS.white}
            style={
              Platform.OS === 'android'
                ? {
                    marginVertical: -hp(2),
                    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
                  }
                : undefined
            }
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress || isDisabled }}
    >
      {content}
    </TouchableOpacity>
  );
}
