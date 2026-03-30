import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { sendSmsCode, verifySmsCode } from '../services/auth';
import { buildAuthErrorPresentation } from '../utils/authErrorPresentation';
import { maskPhoneNumber } from '../utils/phoneFormat';
import { VERIFICATION_CODE_LENGTH } from '../constants/auth/identityVerification';
import { useVerificationCodeInput } from './useVerificationCodeInput';

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
  const [verifyError, setVerifyError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const resetCodeRef = useRef<() => void>(() => {});

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
        resetCodeRef.current();
        Alert.alert(presentation.title, presentation.alertMessage);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [requestedPhoneNumber, verifyFallbackMessage],
  );

  const {
    code,
    resetCode,
    handlePressNumber,
    handlePressDelete,
  } = useVerificationCodeInput({
    codeLength: VERIFICATION_CODE_LENGTH,
    disabled: isVerifying || isVerified,
    onComplete: submitVerificationCode,
  });

  resetCodeRef.current = resetCode;

  const startVerification = useCallback(
    async (phoneNumber: string) => {
      if (isSending || !phoneNumber) {
        return false;
      }

      setIsSending(true);

      try {
        await sendSmsCode({ phoneNumber });
        setRequestedPhoneNumber(phoneNumber);
        resetCode();
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
    [isSending, resetCode, sendFallbackMessage],
  );

  const resendCode = useCallback(async () => {
    if (isSending || !requestedPhoneNumber) {
      return false;
    }

    setIsSending(true);
    resetCode();
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
  }, [isSending, requestedPhoneNumber, resendFallbackMessage, resetCode]);

  const backToForm = useCallback(() => {
    setPhase('form');
    setRequestedPhoneNumber('');
    resetCode();
    setVerifyError('');
    setIsVerified(false);
  }, [resetCode]);

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
