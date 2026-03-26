import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import type { HomeWeatherGuideItem } from '../../utils/homeWeatherPresentation';
import HomeWeatherGuideItemRow from './HomeWeatherGuideItemRow';

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
          <Text className="mb-2 text-xl font-bold text-gray-800">소비 날씨 기준</Text>
          <Text className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
            최근 평균과 비교해 오늘 소비가 어느 정도 강한지 날씨처럼 보여주는 기준이에요.
          </Text>

          <View className="space-y-4">
            {items.map(item => (
              <HomeWeatherGuideItemRow key={item.type} item={item} />
            ))}
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
