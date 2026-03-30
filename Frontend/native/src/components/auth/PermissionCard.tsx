import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { PermissionMeta } from '../../constants/auth/permissionConfig';
import {
  PermissionKey,
  PermissionState,
} from '../../hooks/useAppPermissions';

type PermissionCardProps = {
  item: PermissionMeta;
  state: PermissionState;
  onPress: (id: PermissionKey) => void;
};

export default function PermissionCard({
  item,
  state,
  onPress,
}: PermissionCardProps) {
  const isGranted = state === 'granted';
  const isUnsupported = state === 'unsupported';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center rounded-[20px] border bg-white"
      style={{
        paddingHorizontal: wp(16),
        paddingVertical: hp(16),
        borderColor: isGranted ? COLORS.primary50 : COLORS.border,
        backgroundColor: isGranted
          ? COLORS.primary50
          : isUnsupported
            ? COLORS.backgroundSecondary
            : COLORS.white,
        opacity: isUnsupported ? 0.5 : 1,
      }}
      onPress={() => onPress(item.id)}
      disabled={isUnsupported}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: wp(42),
          height: wp(42),
          marginRight: wp(16),
          backgroundColor: COLORS.backgroundSecondary,
        }}
      >
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={wp(20)}
          color={isGranted ? COLORS.primary : COLORS.textTertiary}
        />
      </View>

      <View className="flex-1" style={{ paddingRight: wp(8) }}>
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.bold,
            color: isGranted ? COLORS.primary : COLORS.textPrimary,
            marginBottom: hp(2),
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: fp(12),
            lineHeight: fp(17),
            fontFamily: FONTS.medium,
            color: COLORS.textSecondary,
          }}
        >
          {item.description}
        </Text>
      </View>

      <View
        className="items-center justify-center rounded-full border"
        style={{
          width: wp(24),
          height: wp(24),
          borderWidth: 1.5,
          borderColor: isGranted ? COLORS.primary : COLORS.border,
          backgroundColor: isGranted ? COLORS.primary : 'transparent',
        }}
      >
        <Ionicons
          name="checkmark-sharp"
          size={wp(14)}
          color={isGranted ? COLORS.textInverse : COLORS.border}
        />
      </View>
    </TouchableOpacity>
  );
}
