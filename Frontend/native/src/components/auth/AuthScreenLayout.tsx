import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fp, hp, wp } from '../../constants/theme';
import type { RootNavigationProp } from '../../types';

interface AuthScreenLayoutProps {
  title: string;
  children: React.ReactNode;
  keyboardAware?: boolean;
  headerBorder?: boolean;
  keyboardVerticalOffset?: number;
  scrollContentStyle?: StyleProp<ViewStyle>;
}

const authHeaderHeight = hp(56);
const authLayoutStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: wp(16),
    height: authHeaderHeight,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderColor: COLORS.gray100,
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
  },
  headerRight: {
    width: wp(32),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(40),
  },
};

export default function AuthScreenLayout({
  title,
  children,
  keyboardAware = true,
  headerBorder = false,
  keyboardVerticalOffset,
  scrollContentStyle,
}: AuthScreenLayoutProps) {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();

  const scrollView = (
    <ScrollView
      contentContainerStyle={[authLayoutStyles.scrollContent, scrollContentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );

  return (
    <View className="flex-1" style={authLayoutStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View
        className="flex-row items-center justify-between"
        style={[
          authLayoutStyles.header,
          headerBorder ? authLayoutStyles.headerBorder : null,
          { paddingTop: insets.top, height: authHeaderHeight + insets.top },
        ]}
      >
        <TouchableOpacity
          style={authLayoutStyles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text className="font-sans-bold text-text" style={authLayoutStyles.headerTitle}>
          {title}
        </Text>
        <View style={authLayoutStyles.headerRight} />
      </View>

      {keyboardAware ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={authLayoutStyles.content}
          keyboardVerticalOffset={
            keyboardVerticalOffset ?? (Platform.OS === 'ios' ? hp(20) : 0)
          }
        >
          {scrollView}
        </KeyboardAvoidingView>
      ) : (
        <View style={authLayoutStyles.content}>{scrollView}</View>
      )}
    </View>
  );
}
