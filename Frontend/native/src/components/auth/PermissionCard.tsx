import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import {
  PermissionKey,
  PermissionState,
} from '../../hooks/useAppPermissions';
import { PermissionMeta } from '../../constants/auth/permissionConfig';

// 권한 카드의 시각 표현을 공통 컴포넌트로 분리해 다른 화면에서도 재사용할 수 있게 둡니다.
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
      style={[
        styles.permissionCard,
        isGranted && styles.grantedCard,
        isUnsupported && styles.unsupportedCard,
      ]}
      onPress={() => onPress(item.id)}
      disabled={isUnsupported}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={wp(20)}
          color={isGranted ? COLORS.primary : COLORS.textTertiary}
        />
      </View>

      <View style={styles.permissionCopy}>
        <Text style={[styles.permissionTitle, isGranted && styles.grantedText]}>
          {item.title}
        </Text>
        <Text style={styles.permissionDescription}>{item.description}</Text>
      </View>

      <View
        style={[
          styles.checkCircle,
          isGranted ? styles.checkCircleGranted : styles.checkCircleEmpty,
        ]}
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

const styles = StyleSheet.create({
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(20),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  grantedCard: {
    borderColor: COLORS.primary50,
    backgroundColor: '#FAFAFF',
  },
  unsupportedCard: {
    opacity: 0.5,
    backgroundColor: COLORS.backgroundSecondary,
  },
  iconCircle: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(16),
  },
  permissionCopy: {
    flex: 1,
    paddingRight: wp(8),
  },
  permissionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  grantedText: {
    color: COLORS.primary,
  },
  permissionDescription: {
    fontSize: fp(12),
    lineHeight: fp(17),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleEmpty: {
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  checkCircleGranted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});
