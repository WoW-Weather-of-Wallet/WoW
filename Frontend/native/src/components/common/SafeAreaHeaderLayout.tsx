import React, { type ReactNode } from 'react';
import { StatusBar, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface SafeAreaHeaderLayoutProps {
  children: ReactNode;
  headerContent: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  headerDockStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  topPadding?: number;
}

export default function SafeAreaHeaderLayout({
  children,
  headerContent,
  containerStyle,
  headerDockStyle,
  contentStyle,
  backgroundColor = COLORS.background,
  topPadding = 0,
}: SafeAreaHeaderLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor }, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      <View style={[headerDockStyle, { paddingTop: insets.top + topPadding }]}>
        {headerContent}
      </View>

      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </View>
  );
}
