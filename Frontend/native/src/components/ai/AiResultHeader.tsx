import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp } from '../../constants/theme';

interface AiResultHeaderProps {
  displayName: string;
  title: string;
}

export default function AiResultHeader({ displayName, title }: AiResultHeaderProps) {
  return (
    <View style={{ gap: hp(4) }}>
      <Text
        style={{
          fontSize: fp(24),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.extraBold,
            color: COLORS.primaryDark,
          }}
        >
          {displayName}
        </Text>
      </Text>
      <Text
        style={{
          fontSize: fp(24),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        <Text
          style={{
            color: COLORS.primaryDark,
            fontFamily: FONTS.extraBold,
          }}
        >
          {title}
        </Text>
      </Text>
    </View>
  );
}
