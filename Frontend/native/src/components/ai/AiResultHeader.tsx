import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp } from '../../constants/theme';

interface AiResultHeaderProps {
  displayName: string;
  title: string;
}

export default function AiResultHeader({ displayName, title }: AiResultHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.userName}>
        <Text style={styles.userNameHighlight}>{displayName}</Text>
      </Text>
      <Text style={styles.title}>
        <Text style={styles.highlightExtraBold}>{title}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: hp(32),
  },
  userName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: hp(4),
  },
  highlightExtraBold: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.extraBold,
  },
  userNameHighlight: {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  },
});
