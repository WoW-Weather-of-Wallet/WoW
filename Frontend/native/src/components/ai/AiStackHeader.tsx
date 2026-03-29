import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface AiStackHeaderProps {
  title: string;
  showBackButton?: boolean;
  onPressBack?: () => void;
}

export function buildAiStackHeaderTitle(name?: string | null, month?: number) {
  if (!month) {
    return name?.trim() ? `${name.trim()}님의 AI 소비 피드백` : 'AI 소비 피드백';
  }

  return name?.trim()
    ? `${name.trim()}님의 ${month}월 AI 소비 피드백`
    : `${month}월 AI 소비 피드백`;
}

export default function AiStackHeader({
  title,
  showBackButton = false,
  onPressBack,
}: AiStackHeaderProps) {
  const sideWidth = wp(36);

  return (
    <View className="flex-row items-center" style={{ minHeight: hp(40) }}>
      <View style={{ width: sideWidth, alignItems: 'flex-start' }}>
        {showBackButton ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
            activeOpacity={0.8}
            onPress={onPressBack}
            style={{
              width: sideWidth,
              height: sideWidth,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={wp(22)} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: fp(16),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {title}
      </Text>

      <View style={{ width: sideWidth }} />
    </View>
  );
}
