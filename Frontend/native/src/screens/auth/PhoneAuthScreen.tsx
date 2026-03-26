import React, { useRef } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import AuthActionButton from '../../components/common/AuthActionButton';
import IdentityVerificationFields from '../../components/common/IdentityVerificationFields';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import {
  IDENTITY_NEXT_LABEL,
  PHONE_NUMBER_PLACEHOLDER,
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
} from '../../constants/auth/identityVerification';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useIdentityVerificationForm, usePhoneAuthFlow } from '../../hooks';
import type { RootScreenProps } from '../../types';
import type { PhoneAuthRouteParams, SignupMode } from '../../types/auth';
import { decodeUnicodeEscapes } from '../../utils/authIdentity';

const SCROLL_CONTENT_PADDING_TOP = hp(60);
const SCROLL_CONTENT_PADDING_BOTTOM = hp(40);
const BOTTOM_MIN_PADDING = hp(24);
const CHEVRON_ICON_SIZE = wp(24);
const SSN_BACK_INPUT_WIDTH = wp(30);

export default function PhoneAuthScreen({
  route,
}: RootScreenProps<'PhoneAuth'>) {
  const insets = useSafeAreaInsets();
  const routeParams = (route?.params ?? {}) as PhoneAuthRouteParams;
  const signupMode: SignupMode =
    routeParams.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';
  const initialSsafyName =
    typeof routeParams.name === 'string'
      ? (decodeUnicodeEscapes(routeParams.name) ?? '').trim()
      : '';
  const isLockedSsafyName = isSsafySignup && initialSsafyName.length >= 2;

  const {
    termsVisible,
    isSendingCode,
    submitError,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
    clearSubmitError,
  } = usePhoneAuthFlow({
    routeParams,
    signupMode,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const {
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
  } = useIdentityVerificationForm({
    initialValues: { name: initialSsafyName },
    telecomPlaceholder: TELECOM_PLACEHOLDER,
    onComplete: (data) => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      handleIdentityComplete(data);
    },
    onValuesChange: () => {
      if (submitError) {
        clearSubmitError();
      }
    },
  });

  return (
    <>
      <AuthStepLayout
        currentStep={1}
        totalSteps={5}
        title={'본인인증을 위해\n정보를 입력해 주세요'}
        description="이름, 주민등록번호, 휴대폰 번호를 입력하면 문자 인증을 진행할 수 있어요."
        scrollViewRef={scrollViewRef}
        scrollContentPaddingTop={SCROLL_CONTENT_PADDING_TOP}
        scrollContentPaddingBottom={SCROLL_CONTENT_PADDING_BOTTOM}
        bottomMinPadding={BOTTOM_MIN_PADDING}
        bottomContent={
          <AuthActionButton
            label={IDENTITY_NEXT_LABEL}
            loading={isSendingCode}
            disabled={!isFormValid || isSendingCode}
            active={isFormValid && !isSendingCode}
            onPress={handleSubmit}
            containerStyle={{
              backgroundColor: COLORS.border,
              borderRadius: wp(30),
              paddingVertical: hp(16),
              alignItems: 'center',
            }}
            activeContainerStyle={{ backgroundColor: COLORS.primary }}
            textStyle={{
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
            activeTextStyle={{ color: COLORS.textInverse }}
            loadingColor={COLORS.textInverse}
          />
        }
      >
        <IdentityVerificationFields
          nameWrapperStyle={{ marginBottom: hp(32) }}
          phoneWrapperStyle={{ marginBottom: hp(32) }}
          nameSection={{
            value: name,
            containerStyle: {
              borderBottomWidth: 1.5,
              borderBottomColor: COLORS.textPrimary,
              paddingVertical: hp(8),
              minHeight: hp(50),
              justifyContent: 'center',
            },
            valueStyle: [
              {
                fontSize: fp(24),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                padding: 0,
                margin: 0,
              },
              { letterSpacing: name.length > 0 ? 2 : 0 },
            ],
            helperText: isSsafySignup
              ? isLockedSsafyName
                ? 'SSAFY 계정에 등록된 이름이 자동으로 입력되었어요.'
                : 'SSAFY 이름을 불러오지 못했어요. 본인 이름을 직접 입력해 주세요.'
              : undefined,
            helperTextStyle: {
              color: COLORS.textTertiary,
              marginTop: hp(12),
            },
            placeholderTextColor: COLORS.textTertiary,
            editable: !isLockedSsafyName,
            onChangeText: (value) => {
              if (isLockedSsafyName) {
                return;
              }
              setName(value);
            },
            inputProps: {
              onSubmitEditing: handleNameSubmit,
              returnKeyType: 'next',
              autoFocus: !isLockedSsafyName,
            },
          }}
          ssnSection={
            step >= 2
              ? {
                  frontValue: ssnFront,
                  backValue: ssnBack,
                  onFrontChange: handleSsnFrontChange,
                  onBackChange: handleSsnBackChange,
                  frontInputRef: ssnFrontRef,
                  backInputRef: ssnBackRef,
                  containerStyle: {
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    marginBottom: hp(32),
                  },
                  frontContainerStyle: [
                    {
                      borderBottomWidth: 1.5,
                      borderBottomColor: COLORS.textPrimary,
                      paddingVertical: hp(8),
                      minHeight: hp(50),
                      justifyContent: 'center',
                    },
                    { flex: 1.1, justifyContent: 'center' },
                  ],
                  frontValueStyle: [
                    {
                      fontSize: fp(24),
                      fontFamily: FONTS.bold,
                      color: COLORS.textPrimary,
                      padding: 0,
                      margin: 0,
                    },
                    {
                      textAlign: 'center',
                      letterSpacing: ssnFront.length > 0 ? 4 : 0,
                    },
                  ],
                  backContainerStyle: [
                    {
                      borderBottomWidth: 1.5,
                      borderBottomColor: COLORS.textPrimary,
                      paddingVertical: hp(8),
                      minHeight: hp(50),
                      justifyContent: 'center',
                    },
                    {
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ],
                  backValueStyle: [
                    {
                      fontSize: fp(24),
                      fontFamily: FONTS.bold,
                      color: COLORS.textPrimary,
                      padding: 0,
                      margin: 0,
                    },
                    {
                      width: SSN_BACK_INPUT_WIDTH,
                      textAlign: 'center',
                      letterSpacing: 4,
                    },
                  ],
                  dashStyle: {
                    fontSize: fp(20),
                    fontFamily: FONTS.regular,
                    color: COLORS.textPrimary,
                    marginHorizontal: wp(12),
                    marginBottom: hp(16),
                  },
                  maskingTextStyle: {
                    fontSize: fp(24),
                    fontFamily: FONTS.bold,
                    color: COLORS.textPrimary,
                    letterSpacing: wp(6),
                    marginTop: Platform.OS === 'ios' ? hp(4) : 0,
                  },
                  placeholderTextColor: COLORS.textTertiary,
                }
              : undefined
          }
          phoneSection={
            step >= 3
              ? {
                  telecom,
                  telecomPlaceholder: TELECOM_PLACEHOLDER,
                  phone,
                  onOpenTelecomModal: openTelecomModal,
                  onPhoneChange: handlePhoneChange,
                  phonePlaceholder: PHONE_NUMBER_PLACEHOLDER,
                  selectorStyle: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1.5,
                    borderBottomColor: COLORS.textPrimary,
                    paddingVertical: hp(8),
                  },
                  telecomTextStyle: {
                    fontSize: fp(24),
                    fontFamily: FONTS.bold,
                    color: COLORS.textPrimary,
                  },
                  placeholderTextStyle: {
                    color: COLORS.textTertiary,
                  },
                  phoneInputContainerStyle: [
                    {
                      borderBottomWidth: 1.5,
                      borderBottomColor: COLORS.textPrimary,
                      paddingVertical: hp(8),
                      minHeight: hp(50),
                      justifyContent: 'center',
                    },
                    { marginTop: hp(32) },
                  ],
                  phoneInputStyle: [
                    {
                      fontSize: fp(24),
                      fontFamily: FONTS.bold,
                      color: COLORS.textPrimary,
                      padding: 0,
                      margin: 0,
                    },
                    { letterSpacing: phone.length > 0 ? 2 : 0 },
                  ],
                  errorTextStyle: {
                    fontSize: fp(14),
                    fontFamily: FONTS.medium,
                    color: COLORS.error,
                    marginTop: hp(12),
                  },
                  errorText: submitError,
                  phoneInputRef: phoneRef,
                  chevronIconSize: CHEVRON_ICON_SIZE,
                  chevronIconColor: COLORS.textPrimary,
                  placeholderTextColor: COLORS.textTertiary,
                }
              : undefined
          }
        />
      </AuthStepLayout>

      <TelecomSelectModal
        visible={modalVisible}
        onClose={closeTelecomModal}
        onSelect={handleTelecomSelect}
        options={TELECOM_OPTIONS}
        bottomInset={insets.bottom}
        overlayStyle={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end',
        }}
        contentStyle={{
          backgroundColor: COLORS.background,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          paddingHorizontal: wp(24),
          paddingTop: hp(24),
          paddingBottom: hp(16),
        }}
        headerStyle={{
          marginBottom: hp(16),
          alignItems: 'center',
        }}
        titleStyle={{
          fontSize: fp(18),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
        itemStyle={{
          paddingVertical: hp(18),
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray100,
        }}
        itemTextStyle={{
          fontSize: fp(18),
          fontFamily: FONTS.medium,
          color: COLORS.textPrimary,
          textAlign: 'center',
        }}
      />

      <TermsBottomSheet
        visible={termsVisible}
        flow={routeParams.flow}
        onClose={handleTermsClose}
        onConfirm={(agreed) => {
          void handleTermsConfirm(agreed);
        }}
      />
    </>
  );
}
