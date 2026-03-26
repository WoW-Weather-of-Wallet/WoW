import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import TelecomSelectModal from '../../components/common/TelecomSelectModal';
import { styles, CONSTANTS } from './PhoneAuthScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { TELECOM_OPTIONS } from '../../constants/auth/identityVerification';
import type {
  PhoneAuthRouteParams,
  SignupMode,
} from '../../types/auth';
import type { RootScreenProps } from '../../types';
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
        title={'본인 확인을 위해\n정보를 입력해 주세요.'}
        description="문자 인증을 진행하기 위해 본인 정보를 먼저 확인할게요."
        scrollViewRef={scrollViewRef}
        scrollContentPaddingTop={CONSTANTS.scrollContentPaddingTop}
        scrollContentPaddingBottom={CONSTANTS.scrollContentPaddingBottom}
        bottomMinPadding={CONSTANTS.bottomMinPadding}
        bottomContent={
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isFormValid && !isSendingCode && styles.activeButton,
            ]}
            disabled={!isFormValid || isSendingCode}
            onPress={handleSubmit}
          >
            {isSendingCode ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text
                style={[
                  styles.confirmButtonText,
                  isFormValid && !isSendingCode && styles.activeButtonText,
                ]}
              >
                다음
              </Text>
            )}
          </TouchableOpacity>
        }
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
          <View style={styles.underlineContainer}>
            <TextInput
              style={[
                styles.bareInput,
                { letterSpacing: name.length > 0 ? 2 : 0 },
              ]}
              value={name}
              onChangeText={(value) => {
                if (isLockedSsafyName) {
                  return;
                }
                setName(value);
              }}
              placeholder="이름"
              placeholderTextColor={COLORS.textTertiary}
              onSubmitEditing={handleNameSubmit}
              returnKeyType="next"
              autoFocus={!isLockedSsafyName}
              editable={!isLockedSsafyName}
            />
          </View>
          {isSsafySignup && (
            <Text style={{ color: COLORS.textTertiary, marginTop: hp(12) }}>
              {isLockedSsafyName
                ? 'SSAFY 계정 이름은 수정할 수 없어요.'
                : 'SSAFY 이름을 불러오지 못해 직접 입력해 주세요.'}
            </Text>
          )}
        </Animated.View>

        {step >= 2 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.ssnSection}>
            <View
              style={[
                styles.underlineContainer,
                { flex: 1.1, justifyContent: 'center' },
              ]}
            >
              <TextInput
                ref={ssnFrontRef}
                style={[
                  styles.bareInput,
                  {
                    textAlign: 'center',
                    letterSpacing: ssnFront.length > 0 ? 4 : 0,
                  },
                ]}
                value={ssnFront}
                onChangeText={handleSsnFrontChange}
                placeholder="YYMMDD"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <Text style={styles.dash}>-</Text>
            <View style={[styles.underlineContainer, styles.ssnBackContainer]}>
              <TextInput
                ref={ssnBackRef}
                style={[
                  styles.bareInput,
                  {
                    width: CONSTANTS.ssnBackInputWidth,
                    textAlign: 'center',
                    letterSpacing: 4,
                  },
                ]}
                value={ssnBack}
                onChangeText={handleSsnBackChange}
                keyboardType="number-pad"
                maxLength={1}
              />
              <Text style={styles.ssnMasking}>******</Text>
            </View>
          </Animated.View>
        )}

        {step >= 3 && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.inputSection}>
            <TouchableOpacity
              style={styles.telecomSelector}
              onPress={openTelecomModal}
            >
              <Text
                style={[
                  styles.telecomText,
                  telecom === TELECOM_PLACEHOLDER && styles.placeholderText,
                ]}
              >
                {telecom}
              </Text>
              <Ionicons
                name="chevron-down"
                size={CONSTANTS.chevronIconSize}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <View style={[styles.underlineContainer, { marginTop: hp(32) }]}>
              <TextInput
                ref={phoneRef}
                style={[
                  styles.bareInput,
                  { letterSpacing: phone.length > 0 ? 2 : 0 },
                ]}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="휴대폰 번호 (- 없이 입력)"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            {submitError.length > 0 && (
              <Text style={styles.errorText}>{submitError}</Text>
            )}
          </Animated.View>
        )}
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
