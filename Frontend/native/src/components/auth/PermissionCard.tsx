import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import {
  PermissionKey,
  PermissionState,
} from '../../hooks/useAppPermissions';
import { PermissionMeta } from '../../constants/auth/permissionConfig';
import { styles } from './PermissionCard.styles';

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

