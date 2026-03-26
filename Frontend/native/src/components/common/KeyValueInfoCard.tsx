import React from 'react';
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export interface KeyValueInfoItem {
  key?: string;
  label: string;
  value: string;
}

interface KeyValueInfoCardProps {
  items: KeyValueInfoItem[];
  containerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

export default function KeyValueInfoCard({
  items,
  containerStyle,
  rowStyle,
  labelStyle,
  valueStyle,
}: KeyValueInfoCardProps) {
  return (
    <View style={containerStyle}>
      {items.map((item, index) => (
        <View
          key={item.key ?? `${item.label}-${item.value}-${index}`}
          style={rowStyle}
        >
          <Text style={labelStyle}>{item.label}</Text>
          <Text style={valueStyle}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
