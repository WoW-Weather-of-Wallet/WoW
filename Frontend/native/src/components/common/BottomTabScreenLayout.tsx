import React, { type ReactNode } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface BottomTabScreenLayoutProps {
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  topDockContent?: ReactNode;
  topDockStyle?: StyleProp<ViewStyle>;
  topDockTopPadding?: number;
  scrollViewStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollTopPadding?: number;
  scrollBottomPadding?: number;
  showsVerticalScrollIndicator?: boolean;
  backgroundColor?: string;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'style' | 'contentContainerStyle' | 'showsVerticalScrollIndicator'
  >;
}

export default function BottomTabScreenLayout({
  children,
  containerStyle,
  topDockContent,
  topDockStyle,
  topDockTopPadding = 0,
  scrollViewStyle,
  contentContainerStyle,
  scrollTopPadding = 0,
  scrollBottomPadding = 0,
  showsVerticalScrollIndicator = false,
  backgroundColor = COLORS.backgroundSecondary,
  scrollViewProps,
}: BottomTabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const resolvedScrollTopPadding = (topDockContent ? 0 : insets.top) + scrollTopPadding;

  return (
    <View style={[{ flex: 1, backgroundColor }, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      {topDockContent ? (
        <View style={[topDockStyle, { paddingTop: insets.top + topDockTopPadding }]}>
          {topDockContent}
        </View>
      ) : null}

      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingTop: resolvedScrollTopPadding,
            paddingBottom: tabBarHeight + scrollBottomPadding,
          },
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}
