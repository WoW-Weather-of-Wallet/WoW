import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import {
  AgreedTermsModal,
  ProfileEditHeader,
  SettingItem,
  SettingSection,
  SettingsDescriptionRow,
  SettingsEditModal,
  SettingsPinModal,
} from '../../components/mypage';
import { useAuthStore } from '../../store/authStore';
import { useLocalSecurityStore } from '../../store/localSecurityStore';
import { fcmService } from '../../services/fcmService';
import {
  changePassword,
  getNotificationSettings,
  getProfile,
  getSsafyLogoutUrl,
  logout as logoutRequest,
  updateNotificationSettings,
  updateProfile,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { clearPersistedAuthSession } from '../../services/sessionStorage';
import {
  authenticateWithBiometrics,
  verifyPinCode,
} from '../../services/localSecurity';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { validatePassword } from '../../utils/validation';
import { useSettingsScreenSections } from '../../hooks';
import type { MyPageStackNavigationProp } from '../../types';

type EditMode = 'profile' | 'password' | null;
type PinModalStep = 'create' | 'confirm' | 'verify-current' | 'new' | 'confirm-new';
type PinModalMode = 'setup' | 'change' | 'disable';

export default function SettingsScreen() {
  const navigation = useNavigation<MyPageStackNavigationProp<'Settings'>>();
  const logout = useAuthStore((state) => state.logout);
  const sessionUser = useAuthStore((state) => state.user);
  const sessionLoginType = useAuthStore((state) => state.loginType);
  const updateUser = useAuthStore((state) => state.updateUser);
  const securityPreferences = useLocalSecurityStore((state) => state.preferences);
  const refreshSecurityPreferences = useLocalSecurityStore((state) => state.refreshPreferences);
  const persistBiometricEnabled = useLocalSecurityStore((state) => state.setBiometricEnabled);
  const persistPinCode = useLocalSecurityStore((state) => state.setPinCode);
  const removePinCode = useLocalSecurityStore((state) => state.clearPinCode);

  const [profile, setProfile] = useState<NativeUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>('setup');
  const [pinModalStep, setPinModalStep] = useState<PinModalStep>('create');
  const [pinInput, setPinInput] = useState('');
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  // 비밀번호 변경 모달에서 비밀번호 입력/표시 상태를 제어합니다.
  const [isCurrentPwVisible, setIsCurrentPwVisible] = useState(false);
  const [isNewPwVisible, setIsNewPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? 'unknown', []);
  const isPushEnabled = notificationEnabled;

  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getProfile();
      setProfile(response);
      setNotificationEnabled(response.alarmEnabled);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '설정 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      Alert.alert('설정 조회 실패', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void refreshSecurityPreferences();
  }, [refreshSecurityPreferences]);

  const resetForm = () => {
    setName('');
    setGender('');
    setBirthDate('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setIsCurrentPwVisible(false);
    setIsNewPwVisible(false);
    setIsConfirmPwVisible(false);
  };

  const closeEditor = () => {
    setEditMode(null);
    resetForm();
  };

  const openProfileEditor = () => {
    setName(profile?.name ?? '');
    setGender(profile?.gender ?? '');
    setBirthDate(profile?.birthDate ?? '');
    setEditMode('profile');
  };

  const openPhoneEditor = () => {
    navigation.navigate('PhoneUpdate', {
      phoneNumber: profile?.phoneNumber ?? '',
      name: profile?.name ?? '',
      birthDate: profile?.birthDate ?? '',
      gender: profile?.gender ?? '',
    });
  };

  const openPasswordEditor = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setEditMode('password');
  };

  const handleEditProfilePhoto = () => {
    Alert.alert(
      '프로필 사진 변경',
      '프로필 사진 변경 기능은 아직 준비 중입니다.',
    );
  };

  const closePinModal = () => {
    setIsPinModalVisible(false);
    setPinModalMode('setup');
    setPinModalStep('create');
    setPinInput('');
    setPinDraft('');
    setPinError('');
    setIsPinSubmitting(false);
  };

  const openPinEditor = () => {
    setPinError('');
    setPinInput('');
    setPinDraft('');
    setPinModalMode(securityPreferences.pinEnabled ? 'change' : 'setup');
    setPinModalStep(securityPreferences.pinEnabled ? 'verify-current' : 'create');
    setIsPinModalVisible(true);
  };

  const getPinModalTitle = () => {
    switch (pinModalStep) {
      case 'create':
        return '간편 비밀번호 설정';
      case 'confirm':
        return pinModalMode === 'disable' ? '간편 비밀번호 해제' : '간편 비밀번호 확인';
      case 'verify-current':
        return pinModalMode === 'disable' ? '현재 간편 비밀번호 확인' : '기존 간편 비밀번호 확인';
      case 'new':
        return '새 간편 비밀번호';
      case 'confirm-new':
        return '새 비밀번호 확인';
      default:
        return '간편 비밀번호';
    }
  };

  const getPinModalDescription = () => {
    switch (pinModalStep) {
      case 'create':
      case 'new':
        return '6자리 숫자를 입력해 주세요.';
      case 'confirm':
      case 'confirm-new':
        return '같은 번호를 한 번 더 입력해 주세요.';
      case 'verify-current':
        return pinModalMode === 'disable'
          ? '해제를 위해 현재 사용 중인 간편 비밀번호를 입력해 주세요.'
          : '현재 사용 중인 간편 비밀번호를 입력해 주세요.';
      default:
        return '';
    }
  };

  const handleAppendPinDigit = async (digit: string) => {
    if (isPinSubmitting) {
      return;
    }

    const nextValue = `${pinInput}${digit}`.slice(0, 6);
    setPinInput(nextValue);

    if (nextValue.length !== 6) {
      return;
    }

    setIsPinSubmitting(true);

    try {
      if (pinModalStep === 'create') {
        setPinDraft(nextValue);
        setPinInput('');
        setPinError('');
        setPinModalStep('confirm');
        return;
      }

      if (pinModalStep === 'new') {
        setPinDraft(nextValue);
        setPinInput('');
        setPinError('');
        setPinModalStep('confirm-new');
        return;
      }

      if (pinModalStep === 'verify-current') {
        const isValid = await verifyPinCode(nextValue, securityPreferences);
        if (!isValid) {
          setPinInput('');
          setPinError('현재 간편 비밀번호가 올바르지 않아요.');
          return;
        }

        setPinInput('');
        setPinError('');

        if (pinModalMode === 'disable') {
          await removePinCode();
          Alert.alert(
            '해제 완료',
            '간편 로그인용 비밀번호와 생체 인증 설정을 함께 해제했어요.',
          );
          closePinModal();
          return;
        }

        setPinModalStep('new');
        return;
      }

      if (nextValue !== pinDraft) {
        setPinInput('');
        setPinDraft('');
        setPinError('간편 비밀번호가 일치하지 않아요. 처음부터 다시 입력해 주세요.');
        setPinModalStep(pinModalStep === 'confirm' ? 'create' : 'new');
        return;
      }

      await persistPinCode(nextValue);
      Alert.alert(
        '설정 완료',
        '다음부터 앱을 다시 열 때 간편로그인으로 사용할 수 있어요.',
      );
      closePinModal();
    } finally {
      setIsPinSubmitting(false);
    }
  };

  const handleDeletePinDigit = () => {
    if (isPinSubmitting) {
      return;
    }

    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (isUpdatingSecurity) {
      return;
    }

    setIsUpdatingSecurity(true);

    try {
      if (enabled) {
        const result = await authenticateWithBiometrics(
          '생체 인증 사용을 위해 본인 확인을 진행해 주세요.',
        );

        if (!result.success) {
          Alert.alert('생체 인증 설정 실패', result.errorMessage ?? '다시 시도해 주세요.');
          return;
        }
      }

      await persistBiometricEnabled(enabled);
      Alert.alert(
        enabled ? '생체 인증 사용' : '생체 인증 해제',
        enabled
          ? '다음부터 간편로그인 화면에서 생체 인증을 사용할 수 있어요.'
          : '이제 간편로그인 화면에서 생체 인증을 사용하지 않아요.',
      );
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleClearPinCode = () => {
    setPinError('');
    setPinInput('');
    setPinDraft('');
    setPinModalMode('disable');
    setPinModalStep('verify-current');
    setIsPinModalVisible(true);
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (isNotificationSubmitting) {
      return;
    }

    setIsNotificationSubmitting(true);

    try {
      const updated = await updateNotificationSettings({ alarmEnabled: enabled });

      try {
        if (updated.alarmEnabled) {
          await fcmService.registerFcmToken();
        } else {
          await fcmService.unregisterFcmToken();
        }
      } catch (fcmError) {
        console.warn('[Settings] failed to sync notification token', fcmError);
      }

      setNotificationEnabled(updated.alarmEnabled);
      setProfile((prev) => (prev ? { ...prev, alarmEnabled: updated.alarmEnabled } : prev));
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '알림 설정을 변경하지 못했어요. 다시 시도해 주세요.',
      );
      Alert.alert('알림 설정 변경 실패', message);

      try {
        const latest = await getNotificationSettings();
        setNotificationEnabled(latest.alarmEnabled);
        setProfile((prev) => (prev ? { ...prev, alarmEnabled: latest.alarmEnabled } : prev));
      } catch (reloadError) {
        console.warn('[Settings] failed to reload notification settings', reloadError);
      }
    } finally {
      setIsNotificationSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!editMode || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editMode === 'profile') {
        const updated = await updateProfile({
          name: name.trim() || undefined,
          gender: gender.trim() || undefined,
          birthDate: birthDate.trim() || undefined,
        });

        setProfile(updated);
        updateUser({
          userId: updated.userId ?? undefined,
          name: updated.name,
        });
      }

      if (editMode === 'password') {
        // 새 비밀번호 유효성을 검증하고 현재 사용자 아이디 기준 중복 여부도 함께 확인합니다.
        const validation = validatePassword(newPw, profile?.userId || undefined);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        if (currentPw === newPw) {
          throw new Error('현재 비밀번호와 다른 새 비밀번호를 입력해 주세요.');
        }
        if (newPw !== confirmPw) {
          throw new Error('새 비밀번호가 일치하지 않습니다.');
        }


        await changePassword({
          currentPw,
          newPw,
        });
      }

      closeEditor();
    } catch (error) {
      if (editMode === 'password') {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'password-reset',
          fallbackMessage: '비밀번호를 변경하지 못했어요.',
        });
        Alert.alert(presentation.title, presentation.alertMessage);
      } else {
        const message = extractApiErrorMessage(
          error,
          '설정 변경을 완료하지 못했어요.',
        );
        Alert.alert('설정 저장 실패', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    const shouldLogoutSsafy =
      (profile?.loginType ?? sessionLoginType) === 'SSAFY';

    Alert.alert(
      '로그아웃',
      shouldLogoutSsafy
        ? '로그아웃 후 SSAFY 브라우저 세션도 함께 종료됩니다.'
        : '정말 로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            let logoutError: unknown = null;

            try {
              // 로그아웃 전에 서버에 등록된 FCM 토큰을 먼저 해제합니다.
              // 실패하더라도 로그아웃 처리는 계속 진행합니다.
              try {
                await fcmService.unregisterFcmToken();
              } catch (fcmError) {
                console.warn('[Settings] FCM 토큰 해제 실패:', fcmError);
              }

              await logoutRequest();
            } catch (error) {
              logoutError = error;
            }

            await clearPersistedAuthSession();
            logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
            );

            if (shouldLogoutSsafy) {
              setTimeout(() => {
                Linking.openURL(getSsafyLogoutUrl()).catch((error) => {
                  console.warn('[Settings] SSAFY browser logout failed:', error);
                });
              }, 0);
            }

            if (logoutError) {
              const message = extractApiErrorMessage(
                logoutError,
                '서버 로그아웃 요청은 실패했지만 현재 기기에서는 로그아웃 처리했어요.',
              );
              Alert.alert('로그아웃 안내', message);
            }
          },
        },
      ],
    );
  };

  /**
   * 회원 탈퇴 화면으로 이동합니다.
   * - WithdrawScreen 에서 SMS 본인 인증과 탈퇴 처리를 함께 진행합니다.
   * - 등록된 휴대폰 번호를 넘겨 본인 확인 UI를 바로 구성합니다.
   */
  const handleDeleteAccount = () => {
    if (!profile?.phoneNumber) {
      Alert.alert('회원 탈퇴 안내', '등록된 휴대폰 번호를 확인한 뒤 다시 시도해 주세요.');
      return;
    }

    navigation.navigate('Withdraw', {
      phoneNumber: profile?.phoneNumber ?? '',
      name: profile?.name ?? '',
      birthDate: profile?.birthDate ?? '',
      gender: profile?.gender ?? '',
    });
  };

  const { profileDisplayName, loadingMessage, sections } = useSettingsScreenSections({
    profile,
    sessionLoginType,
    securityPreferences,
    notificationEnabled,
    isLoading,
    isNotificationSubmitting,
    appVersion,
    onEditProfile: openProfileEditor,
    onEditPassword: openPasswordEditor,
    onEditPhone: openPhoneEditor,
    onToggleNotifications: (enabled: boolean) => {
      void handleToggleNotifications(enabled);
    },
    onOpenPinEditor: openPinEditor,
    onToggleBiometric: (enabled: boolean) => {
      void handleToggleBiometric(enabled);
    },
    onClearPinCode: handleClearPinCode,
    onOpenTerms: () => setIsTermsModalVisible(true),
    onLogout: handleLogout,
    onDeleteAccount: handleDeleteAccount,
  });

  const headerContent = (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: wp(16), height: hp(56) }}
    >
      <TouchableOpacity style={{ padding: wp(4) }} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: fp(18),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        사용자 설정
      </Text>
      <View style={{ width: wp(32) }} />
    </View>
  );

  return (
    <>
      <BottomTabScreenLayout
        containerStyle={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}
        topDockStyle={{
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderColor: COLORS.gray100,
        }}
        topDockContent={headerContent}
        scrollBottomPadding={hp(20)}
        contentContainerStyle={{ paddingBottom: hp(20) }}
      >
        <ProfileEditHeader
          name={profileDisplayName}
          onEditPress={handleEditProfilePhoto}
        />

        {isLoading ? (
          <View
            className="items-center"
            style={{
              marginTop: hp(20),
              paddingVertical: hp(20),
              gap: hp(10),
              backgroundColor: COLORS.gray50,
            }}
          >
            <ActivityIndicator color={COLORS.primary} />
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              {loadingMessage}
            </Text>
          </View>
        ) : null}

        {sections.map((section) => (
          <SettingSection key={section.key} title={section.title}>
            {section.rows.map((row) =>
              row.kind === 'item' ? (
                <SettingItem key={row.key} {...row.props} />
              ) : (
                <SettingsDescriptionRow
                  key={row.key}
                  description={row.description}
                  switchValue={row.switchValue}
                  onToggle={row.onToggle}
                  disabled={row.disabled}
                />
              ),
            )}
          </SettingSection>
        ))}

        <View style={{ height: hp(40) }} />
      </BottomTabScreenLayout>

      <SettingsEditModal
        visible={editMode !== null}
        editMode={editMode}
        isSubmitting={isSubmitting}
        name={name}
        gender={gender}
        birthDate={birthDate}
        currentPw={currentPw}
        newPw={newPw}
        confirmPw={confirmPw}
        userId={profile?.userId ?? null}
        isCurrentPwVisible={isCurrentPwVisible}
        isNewPwVisible={isNewPwVisible}
        isConfirmPwVisible={isConfirmPwVisible}
        onClose={closeEditor}
        onSubmit={() => {
          void handleSubmit();
        }}
        onChangeCurrentPw={setCurrentPw}
        onChangeNewPw={setNewPw}
        onChangeConfirmPw={setConfirmPw}
        onToggleCurrentPwVisible={() => setIsCurrentPwVisible((prev) => !prev)}
        onToggleNewPwVisible={() => setIsNewPwVisible((prev) => !prev)}
        onToggleConfirmPwVisible={() => setIsConfirmPwVisible((prev) => !prev)}
      />

      <SettingsPinModal
        visible={isPinModalVisible}
        title={getPinModalTitle()}
        description={getPinModalDescription()}
        pinInput={pinInput}
        pinError={pinError}
        onClose={closePinModal}
        onPressNumber={(digit) => {
          void handleAppendPinDigit(digit);
        }}
        onPressDelete={handleDeletePinDigit}
      />

      <AgreedTermsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      {/* 회원 탈퇴는 WithdrawScreen(별도 화면)에서 SMS 인증 후 처리됩니다. */}
    </>

  );
}
