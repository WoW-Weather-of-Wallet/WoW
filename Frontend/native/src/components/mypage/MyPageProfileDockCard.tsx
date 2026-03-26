import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPageProfileDockCardProps {
  name: string;
  badgeLabel: string;
  isLoading: boolean;
}

export default function MyPageProfileDockCard({
  name,
  badgeLabel,
  isLoading,
}: MyPageProfileDockCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeaderRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
        </View>
        <View style={styles.profileTextBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>
              <Text style={styles.profileNameHighlight}>{name}</Text>님
            </Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>{badgeLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.profileLoadingRow}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.profileLoadingText}>정보를 불러오고 있어요...</Text>
        </View>
      ) : null}
    </View>
  );
}
