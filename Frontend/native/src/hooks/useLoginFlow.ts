import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import {
  exchangeSsafyToken,
  getSsafyLoginUrl,
  login,
  parseSsafyCallbackUrl,
  type NativeSsafyCodeLoginResult,
} from '../services/auth';
import type { RootNavigationProp } from '../types';
import { buildLoginErrorPresentation } from '../utils/loginErrorPresentation';
import { useAuthSessionLogin } from './useAuthSessionLogin';

WebBrowser.maybeCompleteAuthSession();

interface LoginCredentials {
  userId: string;
  password: string;
}

export function useLoginFlow(autoLogin = true) {
  const navigation = useNavigation<RootNavigationProp>();
  const { completeAuthSession } = useAuthSessionLogin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const handledSsafyUrlRef = useRef<string | null>(null);
  const processingSsafyUrlRef = useRef<string | null>(null);

  const clearLoginError = useCallback(() => {
    setLoginError('');
  }, []);

  const completeSsafyLogin = useCallback(
    async (parsed: NativeSsafyCodeLoginResult) => {
      const response = await exchangeSsafyToken(parsed.code);
      await completeAuthSession({
        response,
        autoLogin,
        source: 'ssafy',
        loginType: 'SSAFY',
      });
      navigation.replace('MainTabs');
    },
    [autoLogin, completeAuthSession, navigation],
  );

  const processSsafyCallbackUrl = useCallback(
    async (url: string | null) => {
      if (!url) {
        return false;
      }

      if (
        handledSsafyUrlRef.current === url ||
        processingSsafyUrlRef.current === url
      ) {
        return true;
      }

      const parsed = parseSsafyCallbackUrl(url);
      if (!parsed) {
        return false;
      }

      processingSsafyUrlRef.current = url;

      try {
        setIsSubmitting(true);
        setLoginError('');

        if (parsed.type === 'signup') {
          navigation.replace('PhoneAuth', {
            signupMode: 'ssafy',
            pendingToken: parsed.pendingToken,
            name: parsed.name,
          });
          handledSsafyUrlRef.current = url;
          return true;
        }

        await completeSsafyLogin(parsed);
        handledSsafyUrlRef.current = url;
        return true;
      } catch (error: any) {
        handledSsafyUrlRef.current = null;
        const presentation = buildLoginErrorPresentation(error, 'ssafy');
        setLoginError(presentation.inlineMessage);
        Alert.alert(presentation.title, presentation.alertMessage);
        return true;
      } finally {
        if (processingSsafyUrlRef.current === url) {
          processingSsafyUrlRef.current = null;
        }
        setIsSubmitting(false);
      }
    },
    [completeSsafyLogin, navigation],
  );

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      void processSsafyCallbackUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void processSsafyCallbackUrl(url);
    });

    return () => subscription.remove();
  }, [processSsafyCallbackUrl]);

  const handleLogin = useCallback(
    async ({ userId, password }: LoginCredentials) => {
      if (!userId.trim() || !password.trim() || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setLoginError('');

      try {
        const response = await login({
          userId: userId.trim(),
          pw: password,
        });
        await completeAuthSession({
          response,
          autoLogin,
          loginType: 'NORMAL',
        });
        navigation.replace('MainTabs');
      } catch (error: any) {
        const presentation = buildLoginErrorPresentation(error, 'general');
        setLoginError(presentation.inlineMessage);
        Alert.alert(presentation.title, presentation.alertMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [autoLogin, completeAuthSession, isSubmitting, navigation],
  );

  const handleSsafyLoginPress = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError('');

      const result = await WebBrowser.openAuthSessionAsync(getSsafyLoginUrl());

      if (result.type === 'success' && 'url' in result && result.url) {
        await processSsafyCallbackUrl(result.url);
      }
    } catch (error: any) {
      const presentation = buildLoginErrorPresentation(error, 'ssafy');
      setLoginError(presentation.inlineMessage);
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      if (!processingSsafyUrlRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, processSsafyCallbackUrl]);

  return {
    isSubmitting,
    loginError,
    clearLoginError,
    handleLogin,
    handleSsafyLoginPress,
  };
}
