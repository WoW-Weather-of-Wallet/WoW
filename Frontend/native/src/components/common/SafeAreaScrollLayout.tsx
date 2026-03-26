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
  bottomMinPadding: number;
  keyboardVerticalOffset?: number;
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
  bottomMinPadding,
  keyboardVerticalOffset,
}: SafeAreaScrollLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={containerStyle}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          scrollContentStyle,
          {
            paddingTop: insets.top + scrollTopPadding,
            paddingBottom: insets.bottom + scrollBottomPadding,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {bottomContent ? (
        <View
          style={[
            bottomContainerStyle,
            { paddingBottom: Math.max(insets.bottom, bottomMinPadding) },
          ]}
        >
          {bottomContent}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
