import React, { useRef } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import AuthActionButton from '../../components/common/AuthActionButton';
import IdentityNameSection from '../../components/common/IdentityNameSection';
import IdentitySsnSection from '../../components/common/IdentitySsnSection';
import TelecomPhoneInputSection from '../../components/common/TelecomPhoneInputSection';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import { styles, CONSTANTS } from './PhoneAuthScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { TELECOM_OPTIONS } from '../../constants/auth/identityVerification';
import type { RootScreenProps } from '../../types';
import type { PhoneAuthRouteParams, SignupMode } from '../../types/auth';
import { decodeUnicodeEscapes } from '../../utils/authIdentity';
import { useIdentityVerificationForm, usePhoneAuthFlow } from '../../hooks';

const TELECOM_PLACEHOLDER = '통신사를 선택해 주세요';

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
        title={'본인 확인을 위해\n개인정보를 입력해 주세요'}
        description="이름, 주민등록번호, 휴대폰 번호를 순서대로 입력해 주세요."
        scrollViewRef={scrollViewRef}
        scrollContentPaddingTop={CONSTANTS.scrollContentPaddingTop}
        scrollContentPaddingBottom={CONSTANTS.scrollContentPaddingBottom}
        bottomMinPadding={CONSTANTS.bottomMinPadding}
        bottomContent={
          <AuthActionButton
            label="다음"
            loading={isSendingCode}
            disabled={!isFormValid || isSendingCode}
            active={isFormValid && !isSendingCode}
            onPress={handleSubmit}
            containerStyle={styles.confirmButton}
            activeContainerStyle={styles.activeButton}
            textStyle={styles.confirmButtonText}
            activeTextStyle={styles.activeButtonText}
            loadingColor={COLORS.textInverse}
          />
        }
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.inputSection}
        >
          <IdentityNameSection
            value={name}
            containerStyle={styles.underlineContainer}
            valueStyle={[
              styles.bareInput,
              { letterSpacing: name.length > 0 ? 2 : 0 },
            ]}
            helperText={
              isSsafySignup
                ? isLockedSsafyName
                  ? 'SSAFY 계정 이름이 자동으로 입력되어 있어요.'
                  : 'SSAFY 이름을 가져오지 못해 직접 입력할 수 있도록 열어두었어요.'
                : undefined
            }
            helperTextStyle={{ color: COLORS.textTertiary, marginTop: hp(12) }}
            placeholderTextColor={COLORS.textTertiary}
            editable={!isLockedSsafyName}
            onChangeText={(value) => {
              if (isLockedSsafyName) {
                return;
              }
              setName(value);
            }}
            inputProps={{
              onSubmitEditing: handleNameSubmit,
              returnKeyType: 'next',
              autoFocus: !isLockedSsafyName,
            }}
          />
        </Animated.View>

        {step >= 2 ? (
          <Animated.View entering={FadeInDown.duration(500)}>
            <IdentitySsnSection
              frontValue={ssnFront}
              backValue={ssnBack}
              onFrontChange={handleSsnFrontChange}
              onBackChange={handleSsnBackChange}
              frontInputRef={ssnFrontRef}
              backInputRef={ssnBackRef}
              containerStyle={styles.ssnSection}
              frontContainerStyle={[
                styles.underlineContainer,
                { flex: 1.1, justifyContent: 'center' },
              ]}
              frontValueStyle={[
                styles.bareInput,
                {
                  textAlign: 'center',
                  letterSpacing: ssnFront.length > 0 ? 4 : 0,
                },
              ]}
              backContainerStyle={[
                styles.underlineContainer,
                styles.ssnBackContainer,
              ]}
              backValueStyle={[
                styles.bareInput,
                {
                  width: CONSTANTS.ssnBackInputWidth,
                  textAlign: 'center',
                  letterSpacing: 4,
                },
              ]}
              dashStyle={styles.dash}
              maskingTextStyle={styles.ssnMasking}
              placeholderTextColor={COLORS.textTertiary}
            />
          </Animated.View>
        ) : null}

        {step >= 3 ? (
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={styles.inputSection}
          >
            <TelecomPhoneInputSection
              telecom={telecom}
              telecomPlaceholder={TELECOM_PLACEHOLDER}
              phone={phone}
              onOpenTelecomModal={openTelecomModal}
              onPhoneChange={handlePhoneChange}
              phonePlaceholder="휴대폰 번호 (- 없이 입력)"
              selectorStyle={styles.telecomSelector}
              telecomTextStyle={styles.telecomText}
              placeholderTextStyle={styles.placeholderText}
              phoneInputContainerStyle={[
                styles.underlineContainer,
                { marginTop: hp(32) },
              ]}
              phoneInputStyle={[
                styles.bareInput,
                { letterSpacing: phone.length > 0 ? 2 : 0 },
              ]}
              errorTextStyle={styles.errorText}
              errorText={submitError}
              phoneInputRef={phoneRef}
              chevronIconSize={CONSTANTS.chevronIconSize}
              chevronIconColor={COLORS.textPrimary}
              placeholderTextColor={COLORS.textTertiary}
            />
          </Animated.View>
        ) : null}
      </AuthStepLayout>

      <TelecomSelectModal
        visible={modalVisible}
        onClose={closeTelecomModal}
        onSelect={handleTelecomSelect}
        options={TELECOM_OPTIONS}
        bottomInset={insets.bottom}
        overlayStyle={styles.modalOverlay}
        contentStyle={styles.modalContent}
        headerStyle={styles.modalHeader}
        titleStyle={styles.modalTitle}
        itemStyle={styles.modalItem}
        itemTextStyle={styles.modalItemText}
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
