import React from 'react';
import {
  Alert,
  Linking,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import { getSsafyLoginUrl } from '../../services/auth';
import RecoveryOption from '../../components/auth/RecoveryOption';
import SsafyRecoveryNotice from '../../components/auth/SsafyRecoveryNotice';

export default function AccountRecoveryEntryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleFindId = () => {
    navigation.navigate('FindId');
  };

  const handleFindPassword = () => {
    navigation.navigate('FindPw');
  };

  const handleSsafyLink = async () => {
    try {
      const url = getSsafyLoginUrl();
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('오류', 'SSAFY 로그인 페이지를 열지 못했어요.');
    }
  };

  return (
    <AuthScreenLayout
      title="계정 찾기"
      keyboardAware={false}
      headerBorder
      scrollContentStyle={{ paddingBottom: hp(24) }}
    >
      <AuthIntroBlock
        title="찾고 싶은 항목을 선택해주세요."
        description="아이디 찾기 또는 비밀번호 찾기부터 시작할 수 있어요."
      />

      <View style={{ gap: hp(8) }}>
        <RecoveryOption
          title="아이디 찾기"
          description="일반 계정의 로그인 아이디를 확인해요."
          icon="person-outline"
          onPress={handleFindId}
        />
        <RecoveryOption
          title="비밀번호 찾기"
          description="본인 확인 후 새 비밀번호를 설정해요."
          icon="lock-closed-outline"
          onPress={handleFindPassword}
        />
      </View>

      <SsafyRecoveryNotice onLinkPress={handleSsafyLink} />
      <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
    </AuthScreenLayout>
  );
}


