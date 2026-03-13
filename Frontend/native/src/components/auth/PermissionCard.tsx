import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import {
  PermissionKey,
  PermissionState,
} from '../../hooks/useAppPermissions';
import {
  PermissionMeta,
  getPermissionActionLabel,
  getPermissionStatusColor,
  getPermissionStatusLabel,
} from '../../constants/auth/permissionConfig';

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
  const isBlocked = state === 'blocked';
  const isUnsupported = state === 'unsupported';
  const isSystemManaged = state === 'system';

  return (
    <View style={styles.permissionCard}>
      <View style={styles.permissionHeader}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={wp(20)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.permissionCopy}>
          <Text style={styles.permissionTitle}>{item.title}</Text>
          <Text style={styles.permissionDescription}>{item.description}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { borderColor: getPermissionStatusColor(state) },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getPermissionStatusColor(state) },
            ]}
          >
            {getPermissionStatusLabel(state)}
          </Text>
        </View>
      </View>

      <View style={styles.permissionActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            (isBlocked || isSystemManaged) && styles.secondaryActionButton,
          ]}
          onPress={() => onPress(item.id)}
          disabled={isUnsupported}
        >
          <Text
            style={[styles.actionButtonText, isUnsupported && styles.disabledText]}
          >
            {getPermissionActionLabel(state)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionCard: {
    borderRadius: wp(20),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(14),
    paddingVertical: hp(13),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  permissionCopy: {
    flex: 1,
    paddingRight: wp(8),
  },
  permissionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: '#111827',
    marginBottom: hp(2),
  },
  permissionDescription: {
    fontSize: fp(12),
    lineHeight: fp(17),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  statusText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
  },
  permissionActions: {
    marginTop: hp(10),
    alignItems: 'flex-end',
  },
  actionButton: {
    borderRadius: wp(999),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    backgroundColor: '#EEF2FF',
  },
  secondaryActionButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  disabledText: {
    color: '#6B7280',
  },
});
