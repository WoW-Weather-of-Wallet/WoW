import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { VERIFICATION_CODE_LENGTH } from '../constants/auth/identityVerification';
import { sendSmsCode, verifySmsCode } from '../services/auth';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { maskPhoneNumber } from '../utils/phoneFormat';

interface UseSmsVerificationOptions {
  sendFallbackMessage: string;
  resendFallbackMessage: string;
  verifyFallbackMessage: string;
}

export function useSmsVerification({
  sendFallbackMessage,
  resendFallbackMessage,
  verifyFallbackMessage,
}: UseSmsVerificationOptions) {
  const [phase, setPhase] = useState<'form' | 'verify'>('form');
  const [requestedPhoneNumber, setRequestedPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const startVerification = useCallback(
    async (phoneNumber: string) => {
      if (isSending || !phoneNumber) {
        return false;
      }

      setIsSending(true);

      try {
        await sendSmsCode({ phoneNumber });
        setRequestedPhoneNumber(phoneNumber);
        setCode('');
        setVerifyError('');
        setIsVerified(false);
        setPhase('verify');
        return true;
      } catch (error) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'sms-send',
          fallbackMessage: sendFallbackMessage,
        });
        Alert.alert(presentation.title, presentation.alertMessage);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [isSending, sendFallbackMessage],
  );

  const submitVerificationCode = useCallback(
    async (finalCode: string) => {
      if (!requestedPhoneNumber) {
        return false;
      }

      setIsVerifying(true);
      setVerifyError('');

      try {
        await verifySmsCode({
          phoneNumber: requestedPhoneNumber,
          code: finalCode,
        });
        setIsVerified(true);
        return true;
      } catch (error) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'sms-verify',
          fallbackMessage: verifyFallbackMessage,
        });
        setVerifyError(presentation.inlineMessage);
        setCode('');
        Alert.alert(presentation.title, presentation.alertMessage);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [requestedPhoneNumber, verifyFallbackMessage],
  );

  const handlePressNumber = useCallback(
    (num: string) => {
      if (isVerifying || isVerified || code.length >= VERIFICATION_CODE_LENGTH) {
        return;
      }

      const nextCode = code + num;
      setCode(nextCode);

      if (nextCode.length === VERIFICATION_CODE_LENGTH) {
        void submitVerificationCode(nextCode);
      }
    },
    [code, isVerified, isVerifying, submitVerificationCode],
  );

  const handlePressDelete = useCallback(() => {
    if (isVerifying || code.length === 0) {
      return;
    }

    setCode((prev) => prev.slice(0, -1));
  }, [code.length, isVerifying]);

  const resendCode = useCallback(async () => {
    if (isSending || !requestedPhoneNumber) {
      return false;
    }

    setIsSending(true);
    setCode('');
    setVerifyError('');
    setIsVerified(false);

    try {
      await sendSmsCode({ phoneNumber: requestedPhoneNumber });
      Alert.alert(
        '재발송 완료',
        `${maskPhoneNumber(requestedPhoneNumber)}으로 인증번호를 다시 전송했습니다.`,
      );
      return true;
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: resendFallbackMessage,
      });
      Alert.alert(presentation.title, presentation.alertMessage);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [isSending, requestedPhoneNumber, resendFallbackMessage]);

  const backToForm = useCallback(() => {
    setPhase('form');
    setRequestedPhoneNumber('');
    setCode('');
    setVerifyError('');
    setIsVerified(false);
  }, []);

  const requestedPhoneDisplay = useMemo(
    () => maskPhoneNumber(requestedPhoneNumber),
    [requestedPhoneNumber],
  );

  return {
    phase,
    code,
    verifyError,
    requestedPhoneNumber,
    requestedPhoneDisplay,
    isSending,
    isVerifying,
    isVerified,
    startVerification,
    submitVerificationCode,
    handlePressNumber,
    handlePressDelete,
    resendCode,
    backToForm,
  };
}
