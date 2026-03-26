import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface AiFeatureCarouselCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AiFeatureCarouselCard({
  title,
  description,
  children,
}: AiFeatureCarouselCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.previewWrapper}>{children}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: wp(310),
    maxWidth: 340,
    height: hp(300),
    marginRight: wp(16),
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    padding: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  previewWrapper: {
    marginBottom: hp(20),
  },
  title: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
    textAlign: 'center',
  },
  description: {
    fontSize: fp(15),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(22),
    paddingHorizontal: wp(10),
  },
});
