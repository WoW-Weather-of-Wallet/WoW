import React, { type ReactNode } from 'react';
import { StatusBar, View, type StyleProp, type ViewStyle } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface BottomTabOverlayLayoutProps {
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  topOverlayContent?: ReactNode;
  topOverlayStyle?: StyleProp<ViewStyle>;
  topOverlayTopPadding?: number;
  bottomOverlayContent?: ReactNode;
  bottomOverlayStyle?: StyleProp<ViewStyle>;
  bottomOverlayBottomPadding?: number;
}

export default function BottomTabOverlayLayout({
  children,
  containerStyle,
  contentContainerStyle,
  backgroundColor = COLORS.backgroundSecondary,
  topOverlayContent,
  topOverlayStyle,
  topOverlayTopPadding = 0,
  bottomOverlayContent,
  bottomOverlayStyle,
  bottomOverlayBottomPadding = 0,
}: BottomTabOverlayLayoutProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={[{ flex: 1, backgroundColor }, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>

      {topOverlayContent ? (
        <View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingTop: insets.top + topOverlayTopPadding,
            },
            topOverlayStyle,
          ]}
        >
          {topOverlayContent}
        </View>
      ) : null}

      {bottomOverlayContent ? (
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: tabBarHeight + bottomOverlayBottomPadding,
            },
            bottomOverlayStyle,
          ]}
        >
          {bottomOverlayContent}
        </View>
      ) : null}
    </View>
  );
}
