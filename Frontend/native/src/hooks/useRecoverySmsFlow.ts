import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  IdentityVerificationData,
  RecoveryFlow,
} from '../types/auth';
import type { RootNavigationProp } from '../types';
import { sendSmsCode } from '../services/auth';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';

interface UseRecoverySmsFlowOptions {
  flow: RecoveryFlow;
  fallbackMessage: string;
  buildParams?: (data: IdentityVerificationData) => Record<string, unknown>;
}

export function useRecoverySmsFlow({
  flow,
  fallbackMessage,
  buildParams,
}: UseRecoverySmsFlowOptions) {
  const navigation = useNavigation<RootNavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityVerificationData | null>(null);

  const handleIdentityComplete = useCallback((data: IdentityVerificationData) => {
    setPendingData(data);
    setTermsVisible(true);
  }, []);

  const handleTermsClose = useCallback(() => {
    setTermsVisible(false);
  }, []);

  const handleTermsConfirm = useCallback(async () => {
    if (!pendingData) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendSmsCode({ phoneNumber: pendingData.phone });

      navigation.navigate('VerifyCode', {
        ...pendingData,
        ...(buildParams ? buildParams(pendingData) : {}),
        flow,
      });
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage,
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [buildParams, fallbackMessage, flow, navigation, pendingData]);

  return {
    isSubmitting,
    termsVisible,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  };
}
