import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSsafyLoginUrl } from '../services/auth';
import type { AccountRecoveryResultRouteParams } from '../types/auth';
import type { RootNavigationProp, RootRouteProp } from '../types';

export function useAccountRecoveryResult() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<'AccountRecoveryResult'>>();
  const routeParams = (route?.params ?? {}) as AccountRecoveryResultRouteParams;
  const { name, userId, userType } = routeParams;

  const isSsafy = userType === 'ssafy';
  const isLocal = userType === 'local';
  const isNone = userType === 'none';
  const isFail = userType === 'fail';

  const handleClose = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleSsafyLink = useCallback(() => {
    Linking.openURL(getSsafyLoginUrl());
  }, []);

  const handleGoToFindPw = useCallback(() => {
    navigation.navigate('FindPw', { prefilledId: userId });
  }, [navigation, userId]);

  const handleGoToFindId = useCallback(() => {
    navigation.navigate('FindId');
  }, [navigation]);

  const handleRetry = useCallback(() => {
    navigation.navigate('FindPw');
  }, [navigation]);

  const handleGoToSignup = useCallback(() => {
    navigation.navigate('PhoneAuth');
  }, [navigation]);

  const title = useMemo(() => {
    if (isNone) {
      return `${name ?? '입력하신 정보로'} 가입된 계정이 없어요`;
    }

    if (isFail) {
      return '본인 확인에 실패했어요';
    }

    return `${name ?? '회원'}님의 계정을 찾았어요`;
  }, [isFail, isNone, name]);

  const subtitle = useMemo(() => {
    if (isLocal) {
      return '입력하신 정보와 일치하는 일반 계정을 찾았어요.';
    }

    if (isSsafy) {
      return '입력하신 정보와 일치하는 SSAFY 계정을 찾았어요.';
    }

    if (isNone) {
      return '입력하신 정보와 일치하는 가입 계정을 찾지 못했어요.';
    }

    return '입력한 정보가 맞는지 다시 확인해 주세요.';
  }, [isFail, isLocal, isNone, isSsafy]);

  const secondaryAction = useMemo(() => {
    if (isLocal) {
      return {
        description: '비밀번호도 다시 설정할까요?',
        linkLabel: '비밀번호 찾기',
        onPress: handleGoToFindPw,
      };
    }

    if (isFail) {
      return {
        description: '아이디부터 다시 확인할까요?',
        linkLabel: '아이디 찾기',
        onPress: handleGoToFindId,
      };
    }

    return null;
  }, [handleGoToFindId, handleGoToFindPw, isFail, isLocal]);

  const mainAction = useMemo(() => {
    if (isNone) {
      return {
        label: '회원가입 하러가기',
        onPress: handleGoToSignup,
      };
    }

    if (isFail) {
      return {
        label: '다시 시도하기',
        onPress: handleRetry,
      };
    }

    return {
      label: '로그인 하러가기',
      onPress: handleClose,
    };
  }, [handleClose, handleGoToSignup, handleRetry, isFail, isNone]);

  return {
    name,
    userId,
    isSsafy,
    isLocal,
    isNone,
    isFail,
    title,
    subtitle,
    secondaryAction,
    mainAction,
    handleClose,
    handleSsafyLink,
  };
}
