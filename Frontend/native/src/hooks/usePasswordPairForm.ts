import { useCallback, useMemo, useState } from 'react';
import { validatePassword } from '../utils/validation';

const PASSWORD_ALLOWED_PATTERN =
  /[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g;

interface UsePasswordPairFormOptions {
  identifier?: string;
  minConfirmLength?: number;
}

export function usePasswordPairForm({
  identifier,
  minConfirmLength = 8,
}: UsePasswordPairFormOptions = {}) {
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPasswordState] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const setPassword = useCallback((text: string) => {
    setPasswordState(text.replace(PASSWORD_ALLOWED_PATTERN, ''));
  }, []);

  const setConfirmPassword = useCallback((text: string) => {
    setConfirmPasswordState(text.replace(PASSWORD_ALLOWED_PATTERN, ''));
  }, []);

  const passwordValidation = useMemo(
    () => validatePassword(password, identifier),
    [identifier, password],
  );

  const isPasswordValid = passwordValidation.isValid;
  const isPasswordMatch = isPasswordValid && password === confirmPassword;
  const hasConfirmPassword = confirmPassword.length >= minConfirmLength;
  const canShowMismatch = confirmPassword.length > 0 && password.length >= minConfirmLength;
  const isFormValid = isPasswordValid && hasConfirmPassword && password === confirmPassword;

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setIsConfirmPasswordVisible((prev) => !prev);
  }, []);

  return {
    password,
    confirmPassword,
    isPasswordVisible,
    isConfirmPasswordVisible,
    passwordValidation,
    isPasswordValid,
    isPasswordMatch,
    hasConfirmPassword,
    canShowMismatch,
    isFormValid,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
}
