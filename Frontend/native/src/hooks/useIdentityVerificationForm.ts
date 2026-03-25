import { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import type { IdentityVerificationData } from '../types/auth';

interface UseIdentityVerificationFormOptions {
  initialValues?: Partial<IdentityVerificationData>;
  telecomPlaceholder?: string;
  onComplete?: (data: IdentityVerificationData) => void;
  onValuesChange?: (data: IdentityVerificationData) => void;
}

const DEFAULT_TELECOM_PLACEHOLDER = '통신사를 선택해주세요';

const resolveInitialValues = (
  initialValues: Partial<IdentityVerificationData> | undefined,
  telecomPlaceholder: string,
): IdentityVerificationData => ({
  name: initialValues?.name ?? '',
  ssnFront: initialValues?.ssnFront ?? '',
  ssnBack: initialValues?.ssnBack ?? '',
  telecom: initialValues?.telecom || telecomPlaceholder,
  phone: initialValues?.phone ?? '',
});

const getInitialStep = (
  values: IdentityVerificationData,
  telecomPlaceholder: string,
) => {
  if (values.phone.length >= 10 && values.telecom !== telecomPlaceholder) {
    return 3;
  }

  if (values.ssnFront.length === 6 && values.ssnBack.length === 1) {
    return 3;
  }

  if (values.name.trim().length >= 2) {
    return 2;
  }

  return 1;
};

export function useIdentityVerificationForm({
  initialValues,
  telecomPlaceholder = DEFAULT_TELECOM_PLACEHOLDER,
  onComplete,
  onValuesChange,
}: UseIdentityVerificationFormOptions) {
  const initialForm = resolveInitialValues(initialValues, telecomPlaceholder);

  const [step, setStep] = useState(() => getInitialStep(initialForm, telecomPlaceholder));
  const [name, setName] = useState(initialForm.name);
  const [ssnFront, setSsnFront] = useState(initialForm.ssnFront);
  const [ssnBack, setSsnBack] = useState(initialForm.ssnBack);
  const [telecom, setTelecom] = useState(initialForm.telecom);
  const [phone, setPhone] = useState(initialForm.phone);
  const [modalVisible, setModalVisible] = useState(false);

  const ssnFrontRef = useRef<TextInput>(null);
  const ssnBackRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  useEffect(() => {
    const nextValues = resolveInitialValues(initialValues, telecomPlaceholder);
    setName(nextValues.name);
    setSsnFront(nextValues.ssnFront);
    setSsnBack(nextValues.ssnBack);
    setTelecom(nextValues.telecom);
    setPhone(nextValues.phone);
    setStep(getInitialStep(nextValues, telecomPlaceholder));
  }, [
    initialValues?.name,
    initialValues?.ssnFront,
    initialValues?.ssnBack,
    initialValues?.telecom,
    initialValues?.phone,
    telecomPlaceholder,
  ]);

  useEffect(() => {
    onValuesChange?.({ name, ssnFront, ssnBack, telecom, phone });
  }, [name, ssnFront, ssnBack, telecom, phone, onValuesChange]);

  const handleNameSubmit = useCallback(() => {
    if (name.trim().length >= 2) {
      setStep((prev) => Math.max(prev, 2));
      setTimeout(() => ssnFrontRef.current?.focus(), 150);
    }
  }, [name]);

  const handleSsnFrontChange = useCallback((text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setSsnFront(numeric);

    if (numeric.length === 6) {
      ssnBackRef.current?.focus();
    }
  }, []);

  const openTelecomModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeTelecomModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSsnBackChange = useCallback((text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setSsnBack(numeric);

    if (numeric.length === 1) {
      setStep((prev) => Math.max(prev, 3));
      ssnBackRef.current?.blur();
      setTimeout(() => setModalVisible(true), 300);
    }
  }, []);

  const handleTelecomSelect = useCallback((value: string) => {
    setTelecom(value);
    setModalVisible(false);
    setTimeout(() => phoneRef.current?.focus(), 250);
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text.replace(/[^0-9]/g, ''));
  }, []);

  const getFormData = useCallback(
    (): IdentityVerificationData => ({
      name,
      ssnFront,
      ssnBack,
      telecom,
      phone,
    }),
    [name, ssnFront, ssnBack, telecom, phone],
  );

  const isFormValid =
    step === 1
      ? name.trim().length >= 2
      : step === 2
        ? ssnFront.length === 6 && ssnBack.length === 1
        : telecom !== telecomPlaceholder && phone.length >= 10;

  const handleSubmit = useCallback(() => {
    if (step < 3) {
      if (step === 1) {
        handleNameSubmit();
        return;
      }

      setStep(3);
      setTimeout(() => setModalVisible(true), 100);
      return;
    }

    onComplete?.(getFormData());
  }, [getFormData, handleNameSubmit, onComplete, step]);

  return {
    step,
    name,
    ssnFront,
    ssnBack,
    telecom,
    phone,
    modalVisible,
    isFormValid,
    ssnFrontRef,
    ssnBackRef,
    phoneRef,
    setName,
    handleNameSubmit,
    handleSsnFrontChange,
    handleSsnBackChange,
    handleTelecomSelect,
    handlePhoneChange,
    openTelecomModal,
    closeTelecomModal,
    handleSubmit,
    getFormData,
  };
}
