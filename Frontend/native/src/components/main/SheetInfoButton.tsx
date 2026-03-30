import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, wp } from '../../constants/theme';

type SheetInfoButtonProps = {
  onPress: () => void;
  size?: number;
};

export default function SheetInfoButton({
  onPress,
  size = wp(16),
}: SheetInfoButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.7} className="p-1" onPress={onPress}>
      <Ionicons
        name="information-circle-outline"
        size={size}
        color={COLORS.textSecondary}
      />
    </TouchableOpacity>
  );
}
