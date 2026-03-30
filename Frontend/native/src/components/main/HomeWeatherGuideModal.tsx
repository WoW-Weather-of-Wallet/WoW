import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS, RADIUS, TYPOGRAPHY, hp } from '../../constants/theme';
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
        <Pressable
          className="w-full bg-white shadow-lg"
          style={{ borderRadius: RADIUS.xxl, padding: hp(24) }}
        >
          <Text
            style={{
              marginBottom: hp(8),
              fontSize: TYPOGRAPHY.title.fontSize,
              lineHeight: TYPOGRAPHY.title.lineHeight,
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            소비 날씨 기준
          </Text>
          <Text
            style={{
              marginBottom: hp(24),
              fontSize: TYPOGRAPHY.body.fontSize,
              lineHeight: TYPOGRAPHY.body.lineHeight,
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            최근 평균과 비교해 오늘 소비가 어느 정도 강한지 날씨처럼 보여주는 기준이에요.
          </Text>

          <View className="space-y-4">
            {items.map(item => (
              <HomeWeatherGuideItemRow key={item.type} item={item} />
            ))}
          </View>

          <TouchableOpacity
            className="items-center justify-center"
            onPress={onClose}
            activeOpacity={0.8}
            style={{
              marginTop: hp(24),
              minHeight: hp(52),
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.primary,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.heroMeta.fontSize,
                lineHeight: TYPOGRAPHY.heroMeta.lineHeight,
                fontFamily: FONTS.bold,
                color: COLORS.white,
              }}
            >
              닫기
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
