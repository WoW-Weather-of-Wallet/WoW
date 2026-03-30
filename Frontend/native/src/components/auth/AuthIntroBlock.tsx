import React from 'react';
import { Text, View } from 'react-native';
import { fp, hp } from '../../constants/theme';

interface AuthIntroBlockProps {
  title: string;
  description: React.ReactNode;
  marginBottom?: number;
}

const introStyles = {
  title: {
    fontSize: fp(24),
    lineHeight: fp(34),
    marginBottom: hp(8),
  },
  description: {
    fontSize: fp(15),
  },
};

export default function AuthIntroBlock({
  title,
  description,
  marginBottom = hp(32),
}: AuthIntroBlockProps) {
  return (
    <View style={{ marginBottom }}>
      <Text className="font-sans-bold text-text" style={introStyles.title}>
        {title}
      </Text>
      <Text className="font-sans-medium text-text-secondary" style={introStyles.description}>
        {description}
      </Text>
    </View>
  );
}
