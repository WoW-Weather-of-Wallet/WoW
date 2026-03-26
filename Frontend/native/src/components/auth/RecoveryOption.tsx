import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface RecoveryOptionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function RecoveryOption({
  title,
  description,
  icon,
  onPress,
}: RecoveryOptionProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center border bg-white"
      style={{
        padding: wp(20),
        borderRadius: RADIUS.xl,
        marginBottom: hp(12),
        borderColor: COLORS.gray100,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: wp(48),
          height: wp(48),
          marginRight: wp(16),
          backgroundColor: `${COLORS.primary}10`,
        }}
      >
        <Ionicons name={icon} size={wp(24)} color={COLORS.primary} />
      </View>

      <View className="flex-1">
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
            marginBottom: hp(2),
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: fp(13),
            fontFamily: FONTS.medium,
            color: COLORS.textTertiary,
          }}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={wp(20)}
        color={COLORS.textTertiary}
      />
    </TouchableOpacity>
  );
}
