import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, wp } from '../../constants/theme';
import { styles } from './SpendingStyleGuideModal.styles';

type SpendingStyleGuideHeaderProps = {
  title: string;
  subtitle: ReactNode;
  onClose: () => void;
};

export default function SpendingStyleGuideHeader({
  title,
  subtitle,
  onClose,
}: SpendingStyleGuideHeaderProps) {
  return (
    <View style={styles.modalHeader}>
      <View style={styles.titleRow}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={wp(22)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.modalSubTitle}>{subtitle}</Text>
    </View>
  );
}
