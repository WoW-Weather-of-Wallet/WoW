import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HomeTodayWeatherHintRowProps = {
  hint: string;
  infoIconSize: number;
  onPressInfo: () => void;
};

export default function HomeTodayWeatherHintRow({
  hint,
  infoIconSize,
  onPressInfo,
}: HomeTodayWeatherHintRowProps) {
  return (
    <View
      className="mt-4 flex-row rounded-xl bg-white/10"
      style={{ minHeight: 72, paddingHorizontal: 12, paddingVertical: 14 }}
    >
      <TouchableOpacity
        onPress={onPressInfo}
        className="items-center justify-center p-1"
        activeOpacity={0.7}
        style={{ alignSelf: 'flex-start', marginTop: 1 }}
      >
        <Ionicons name="information-circle-outline" size={infoIconSize} color="white" />
      </TouchableOpacity>
      <Text
        className="ml-2 flex-1 text-sm text-white/90"
        numberOfLines={3}
        style={{ lineHeight: 20 }}
      >
        {hint}
      </Text>
    </View>
  );
}
