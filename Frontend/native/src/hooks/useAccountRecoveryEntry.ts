import { useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { Ionicons } from '@expo/vector-icons';
import { getSsafyLoginUrl } from '../services/auth';
import type { RootNavigationProp } from '../types';

const SSAFY_LINK_ERROR_TITLE = '오류';
const SSAFY_LINK_ERROR_MESSAGE = 'SSAFY 로그인 페이지를 열지 못했어요.';

interface RecoveryOptionItem {
  key: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function useAccountRecoveryEntry() {
  const navigation = useNavigation<RootNavigationProp>();

  const handleFindId = useCallback(() => {
    navigation.navigate('FindId');
  }, [navigation]);

  const handleFindPassword = useCallback(() => {
    navigation.navigate('FindPw');
  }, [navigation]);

  const handleSsafyLink = useCallback(async () => {
    try {
      await Linking.openURL(getSsafyLoginUrl());
    } catch (error) {
      Alert.alert(SSAFY_LINK_ERROR_TITLE, SSAFY_LINK_ERROR_MESSAGE);
    }
  }, []);

  const recoveryOptions = useMemo<RecoveryOptionItem[]>(
    () => [
      {
        key: 'find-id',
        title: '아이디 찾기',
        description: '일반 계정의 로그인 아이디를 확인해요.',
        icon: 'person-outline',
        onPress: handleFindId,
      },
      {
        key: 'find-password',
        title: '비밀번호 찾기',
        description: '본인 확인 후 새 비밀번호를 설정해요.',
        icon: 'lock-closed-outline',
        onPress: handleFindPassword,
      },
    ],
    [handleFindId, handleFindPassword],
  );

  return {
    title: '계정 찾기',
    introTitle: '찾고 싶은 항목을 선택해 주세요.',
    introDescription:
      '아이디 찾기 또는 비밀번호 찾기부터 시작할 수 있어요.',
    recoveryOptions,
    handleSsafyLink,
  };
}
