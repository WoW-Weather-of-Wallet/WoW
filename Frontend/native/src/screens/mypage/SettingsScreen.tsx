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

  // 鍮꾨?踰덊샇 蹂寃?紐⑤떖?먯꽌??鍮꾨?踰덊샇 ?④?/蹂댁엫 泥섎━瑜??꾪븳 ?곹깭?낅땲??
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
        '?ㅼ젙 ?뺣낫瑜?遺덈윭?ㅼ? 紐삵뻽?댁슂. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.',
      );
      Alert.alert('?ㅼ젙 議고쉶 ?ㅽ뙣', message);
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
      '프로필 사진 업로드 API는 아직 백엔드에 준비되지 않았습니다.',
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
        return '媛꾪렪鍮꾨?踰덊샇 ?ㅼ젙';
      case 'confirm':
        return pinModalMode === 'disable' ? '媛꾪렪鍮꾨?踰덊샇 ?댁젣' : '媛꾪렪鍮꾨?踰덊샇 ?뺤씤';
      case 'verify-current':
        return pinModalMode === 'disable' ? '?꾩옱 鍮꾨?踰덊샇 ?뺤씤' : '湲곗〈 鍮꾨?踰덊샇 ?뺤씤';
      case 'new':
        return '??媛꾪렪鍮꾨?踰덊샇';
      case 'confirm-new':
        return '??鍮꾨?踰덊샇 ?뺤씤';
      default:
        return '媛꾪렪鍮꾨?踰덊샇';
    }
  };

  const getPinModalDescription = () => {
    switch (pinModalStep) {
      case 'create':
      case 'new':
        return '6?먮━ ?レ옄瑜??낅젰?댁＜?몄슂.';
      case 'confirm':
      case 'confirm-new':
        return '媛숈? 踰덊샇瑜???踰????낅젰?댁＜?몄슂.';
      case 'verify-current':
        return pinModalMode === 'disable'
          ? '?댁젣瑜??꾪빐 ?꾩옱 ?ъ슜 以묒씤 媛꾪렪鍮꾨?踰덊샇瑜??낅젰?댁＜?몄슂.'
          : '?꾩옱 ?ъ슜 以묒씤 媛꾪렪鍮꾨?踰덊샇瑜??낅젰?댁＜?몄슂.';
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
          setPinError('?꾩옱 媛꾪렪鍮꾨?踰덊샇媛 ?щ컮瑜댁? ?딆븘??');
          return;
        }

        setPinInput('');
        setPinError('');

        if (pinModalMode === 'disable') {
          await removePinCode();
          Alert.alert(
            '?댁젣 ?꾨즺',
            '媛꾪렪濡쒓렇?몄슜 媛꾪렪鍮꾨?踰덊샇? ?앹껜?몄쬆 ?ъ슜 ?ㅼ젙???④퍡 ?댁젣?섏뿀?댁슂.',
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
        setPinError('媛꾪렪鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆븘?? 泥섏쓬遺???ㅼ떆 ?낅젰?댁＜?몄슂.');
        setPinModalStep(pinModalStep === 'confirm' ? 'create' : 'new');
        return;
      }

      await persistPinCode(nextValue);
      Alert.alert(
        '?ㅼ젙 ?꾨즺',
        '?ㅼ쓬遺???깆쓣 ?ㅼ떆 ????媛꾪렪濡쒓렇?몄쑝濡??ъ슜?????덉뼱??',
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
          '?앹껜 ?몄쬆 ?ъ슜???꾪빐 蹂몄씤 ?뺤씤??吏꾪뻾?댁＜?몄슂.',
        );

        if (!result.success) {
          Alert.alert('?앹껜 ?몄쬆 ?ㅼ젙 ?ㅽ뙣', result.errorMessage ?? '?ㅼ떆 ?쒕룄?댁＜?몄슂.');
          return;
        }
      }

      await persistBiometricEnabled(enabled);
      Alert.alert(
        enabled ? '?앹껜 ?몄쬆 ?ъ슜' : '?앹껜 ?몄쬆 ?댁젣',
        enabled
          ? '?ㅼ쓬遺??媛꾪렪濡쒓렇???붾㈃?먯꽌 ?앹껜?몄쬆???ъ슜?????덉뼱??'
          : '?댁젣 媛꾪렪濡쒓렇???붾㈃?먯꽌 ?앹껜?몄쬆???ъ슜?섏? ?딆븘??',
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
        '?뚮┝ ?ㅼ젙??蹂寃쏀븯吏 紐삵뻽?댁슂. ?ㅼ떆 ?쒕룄??二쇱꽭??',
      );
      Alert.alert('?뚮┝ ?ㅼ젙 蹂寃??ㅽ뙣', message);

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
        // 1. ??鍮꾨?踰덊샇 ?좏슚??寃??(蹂듭옟?? ?곗냽?? 諛섎났????
        // ?꾩옱 濡쒓렇?몃맂 ?ъ슜?먯쓽 ?꾩씠?붿? ?議고븯湲??꾪빐 profile?.userId瑜??꾨떖?⑸땲??
        const validation = validatePassword(newPw, profile?.userId || undefined);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        if (currentPw === newPw) {
          throw new Error('?꾩옱 鍮꾨?踰덊샇? ?ㅻⅨ ??鍮꾨?踰덊샇瑜??낅젰?댁＜?몄슂.');
        }
        if (newPw !== confirmPw) {
          throw new Error('??鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.');
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
          fallbackMessage: '鍮꾨?踰덊샇瑜?蹂寃쏀븯吏 紐삵뻽?댁슂.',
        });
        Alert.alert(presentation.title, presentation.alertMessage);
      } else {
        const message = extractApiErrorMessage(
          error,
          '?ㅼ젙 蹂寃쎌쓣 ??ν븯吏 紐삵뻽?댁슂.',
        );
        Alert.alert('?ㅼ젙 ????ㅽ뙣', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    const shouldLogoutSsafy =
      (profile?.loginType ?? sessionLoginType) === 'SSAFY';

    Alert.alert(
      '濡쒓렇?꾩썐',
      shouldLogoutSsafy
        ? '濡쒓렇?꾩썐 ??SSAFY 釉뚮씪?곗? ?몄뀡???④퍡 醫낅즺?⑸땲??'
        : '?뺣쭚 濡쒓렇?꾩썐 ?섏떆寃좎뒿?덇퉴?',
      [
        { text: '痍⑥냼', style: 'cancel' },
        {
          text: '濡쒓렇?꾩썐',
          style: 'destructive',
          onPress: async () => {
            let logoutError: unknown = null;

            try {
              // [P1 Fix] 濡쒓렇?꾩썐 ???쒕쾭???깅줉??FCM ?좏겙??癒쇱? ?쒓굅?⑸땲??
              // ?ㅽ뙣?섎뜑?쇰룄 濡쒓렇?꾩썐 泥섎━??怨꾩냽 吏꾪뻾?⑸땲??
              try {
                await fcmService.unregisterFcmToken();
              } catch (fcmError) {
                console.warn('[Settings] FCM ?좏겙 ?댁젣 ?ㅽ뙣:', fcmError);
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
                '?쒕쾭 濡쒓렇?꾩썐 ?붿껌? ?ㅽ뙣?덉?留? ?꾩옱 湲곌린?먯꽌??濡쒓렇?꾩썐 泥섎━?섏뿀?듬땲??',
              );
              Alert.alert('濡쒓렇?꾩썐 ?덈궡', message);
            }
          },
        },
      ],
    );
  };

  /**
   * ?뚯썝 ?덊눜 ?붾㈃?쇰줈 ?대룞?⑸땲??
   * - WithdrawScreen ?먯꽌 SMS 蹂몄씤 ?몄쬆 ???덊눜 泥섎━源뚯? 紐⑤몢 ?대떦?⑸땲??
   * - ?깅줉???꾨줈???뺣낫瑜??④퍡 ?꾨떖???쎄린 ?꾩슜 蹂몄씤 ?뺤씤 UI瑜??꾩꽦?⑸땲??
   */
  const handleDeleteAccount = () => {
    if (!profile?.phoneNumber) {
      Alert.alert('?뚯썝 ?덊눜 ?덈궡', '?깅줉???대???踰덊샇瑜??뺤씤?????ㅼ떆 ?쒕룄?댁＜?몄슂.');
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

      {/* ?뚯썝 ?덊눜??WithdrawScreen(蹂꾨룄 ?붾㈃)?먯꽌 SMS ?몄쬆 ??泥섎━?⑸땲??*/}
    </>

  );
}
