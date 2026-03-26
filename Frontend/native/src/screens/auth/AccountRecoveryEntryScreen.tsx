import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import RecoveryOption from '../../components/auth/RecoveryOption';
import SsafyRecoveryNotice from '../../components/auth/SsafyRecoveryNotice';
import { hp } from '../../constants/theme';
import { useAccountRecoveryEntry } from '../../hooks';

export default function AccountRecoveryEntryScreen() {
  const insets = useSafeAreaInsets();
  const {
    title,
    introTitle,
    introDescription,
    recoveryOptions,
    handleSsafyLink,
  } = useAccountRecoveryEntry();

  return (
    <AuthScreenLayout
      title={title}
      keyboardAware={false}
      headerBorder
      scrollContentStyle={{ paddingBottom: hp(24) }}
    >
      <AuthIntroBlock
        title={introTitle}
        description={introDescription}
      />

      <View style={{ gap: hp(8) }}>
        {recoveryOptions.map((option) => (
          <RecoveryOption
            key={option.key}
            title={option.title}
            description={option.description}
            icon={option.icon}
            onPress={option.onPress}
          />
        ))}
      </View>

      <SsafyRecoveryNotice onLinkPress={handleSsafyLink} />
      <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
    </AuthScreenLayout>
  );
}
