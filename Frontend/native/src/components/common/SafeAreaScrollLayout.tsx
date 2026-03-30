import React, { type ReactNode, type RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollView as ScrollViewType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaScrollLayoutProps {
  children: ReactNode;
  bottomContent?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  bottomContainerStyle?: StyleProp<ViewStyle>;
  scrollViewRef?: RefObject<ScrollViewType | null>;
  scrollTopPadding: number;
  scrollBottomPadding: number;
  scrollBottomMinPadding?: number;
  bottomMinPadding?: number;
  keyboardVerticalOffset?: number;
  keyboardAware?: boolean;
  bounces?: boolean;
  includeTopInset?: boolean;
  includeBottomInset?: boolean;
}

export default function SafeAreaScrollLayout({
  children,
  bottomContent,
  containerStyle,
  scrollContentStyle,
  bottomContainerStyle,
  scrollViewRef,
  scrollTopPadding,
  scrollBottomPadding,
  scrollBottomMinPadding = 0,
  bottomMinPadding = 0,
  keyboardVerticalOffset,
  keyboardAware = true,
  bounces = true,
  includeTopInset = true,
  includeBottomInset = true,
}: SafeAreaScrollLayoutProps) {
  const insets = useSafeAreaInsets();
  const topInset = includeTopInset ? insets.top : 0;
  const bottomInset = includeBottomInset ? insets.bottom : 0;

  const scrollView = (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[
        scrollContentStyle,
        {
          paddingTop: topInset + scrollTopPadding,
          paddingBottom: scrollBottomPadding + Math.max(bottomInset, scrollBottomMinPadding),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={bounces}
    >
      {children}
    </ScrollView>
  );

  if (!keyboardAware) {
    return (
      <View style={containerStyle}>
        {scrollView}
        {bottomContent ? (
          <View
            style={[
              bottomContainerStyle,
              { paddingBottom: Math.max(bottomInset, bottomMinPadding) },
            ]}
          >
            {bottomContent}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={containerStyle}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {scrollView}

      {bottomContent ? (
        <View
          style={[
            bottomContainerStyle,
            { paddingBottom: Math.max(bottomInset, bottomMinPadding) },
          ]}
        >
          {bottomContent}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
