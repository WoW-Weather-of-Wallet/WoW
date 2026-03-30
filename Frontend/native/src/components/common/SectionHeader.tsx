import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, fp, wp } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
}

export default function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ gap: wp(12) }}
    >
      <Text
        style={{
          fontSize: fp(18),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {title}
      </Text>
      {actionLabel ? (
        <Text
          style={{
            fontSize: fp(12),
            fontFamily: FONTS.semiBold,
            color: COLORS.primary,
          }}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}
