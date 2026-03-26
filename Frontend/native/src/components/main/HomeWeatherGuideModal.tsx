import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { wp } from '../../constants/theme';

type WeatherGuideIcon = React.ComponentType<{ size?: number; color?: string }>;

export interface HomeWeatherGuideItem {
  type: string;
  detail: string;
  icon: WeatherGuideIcon;
  color: string;
}

interface HomeWeatherGuideModalProps {
  visible: boolean;
  items: HomeWeatherGuideItem[];
  onClose: () => void;
}

export default function HomeWeatherGuideModal({
  visible,
  items,
  onClose,
}: HomeWeatherGuideModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 p-6"
        onPress={onClose}
      >
        <Pressable className="w-full rounded-3xl bg-white p-6 shadow-lg">
          <Text className="mb-2 text-xl font-bold text-gray-800">소비 날씨 안내</Text>
          <Text className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
            최근 소비 흐름을 바탕으로 현재 소비 상태를 날씨처럼 보여줍니다.
          </Text>

          <View className="space-y-4">
            {items.map((item) => {
              const GuideIcon = item.icon;

              return (
                <View key={item.type} className="mb-6 flex-row items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <GuideIcon size={wp(28)} color={item.color} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-gray-800">{item.type}</Text>
                    <Text className="text-xs text-gray-400">
                      <Text className="font-semibold text-gray-600">{item.detail}</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            className="mt-6 items-center rounded-xl bg-primary py-4"
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="text-base font-bold text-white">닫기</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
