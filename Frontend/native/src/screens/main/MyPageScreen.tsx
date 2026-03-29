import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  View,
} from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { COLORS } from '../../constants/theme';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import {
  AgreedTermsModal,
  MyPageActionButtons,
  MyPagePasswordModal,
  MyPagePhoneGuidanceModal,
  MyPagePinModal,
  MyPageProfileDockCard,
  MyPageProfileInfoModal,
  SettingItem,
  SettingSection,
} from '../../components/mypage';
import { useAuthStore } from '../../store/authStore';
import { useAiStore } from '../../store/aiStore';
import { useLocalSecurityStore } from '../../store/localSecurityStore';
import { fcmService } from '../../services/fcmService';
import {
  changePassword,
  getNotificationSettings,
  getProfile,
  getSsafyLogoutUrl,
  logout as logoutRequest,
  updateNotificationSettings,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { clearPersistedAuthSession } from '../../services/sessionStorage';
import {
  authenticateWithBiometrics,
  verifyPinCode,
} from '../../services/localSecurity';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { maskPhoneNumber } from '../../utils/phoneFormat';
import { validatePassword } from '../../utils/validation';
import { useMyPageSections, useResponsiveLayoutMode } from '../../hooks';
import type { MyPageStackNavigationProp } from '../../types';

type EditMode = 'profile' | 'phone' | 'password' | null;
type PinModalStep = 'create' | 'confirm' | 'verify-current' | 'new' | 'confirm-new';
type PinModalMode = 'setup' | 'change' | 'disable';

/**
 * MyPageScreen (Settings Overhaul)
 * 마이페이지를 설정 중심으로 개편하되, 기존의 '사용자 분류 뱃지'를 프리미엄하게 통합합니다.
 * 보유 카드 및 연결 계좌 관련 코드는 주석 처리하여 보존합니다.
 */
export default function MyPageScreen() {
  const {
    pageHorizontal,
    sectionGap,
    scrollTopPadding,
    scrollBottomPadding,
    topDockTopPadding,
  } = useResponsiveLayoutMode();
  const navigation = useNavigation<MyPageStackNavigationProp<'MyPageHome'>>();
  const logout = useAuthStore((state) => state.logout);
  const sessionUser = useAuthStore((state) => state.user);
  const sessionLoginType = useAuthStore((state) => state.loginType);
  const aiResultData = useAiStore((state) => state.resultData);
  const securityPreferences = useLocalSecurityStore((state) => state.preferences);
  const refreshSecurityPreferences = useLocalSecurityStore((state) => state.refreshPreferences);
  const persistBiometricEnabled = useLocalSecurityStore((state) => state.setBiometricEnabled);
  const persistPinCode = useLocalSecurityStore((state) => state.setPinCode);
  const removePinCode = useLocalSecurityStore((state) => state.clearPinCode);

  const [profile, setProfile] = useState<NativeUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // 비밀번호 변경 관련 상태
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isCurrentPwVisible, setIsCurrentPwVisible] = useState(false);
  const [isNewPwVisible, setIsNewPwVisible] = useState(false);
  const [isConfirmPwVisible, setIsConfirmPwVisible] = useState(false);

  // 간편비밀번호(PIN) 관련 상태
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>('setup');
  const [pinModalStep, setPinModalStep] = useState<PinModalStep>('create');
  const [pinInput, setPinInput] = useState('');
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  // 약관 모달 상태
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? '1.0.0', []);
  const hasLoadedProfileRef = useRef(false);
  const shouldRefreshProfileRef = useRef(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProfile();
      setProfile(response);
    } catch (error) {
      const message = extractApiErrorMessage(error, '프로필 정보를 불러오지 못했어요.');
      Alert.alert('조회 실패', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hasLoadedProfileRef.current = false;
    shouldRefreshProfileRef.current = true;
  }, [sessionUser?.userId]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedProfileRef.current || shouldRefreshProfileRef.current) {
        hasLoadedProfileRef.current = true;
        shouldRefreshProfileRef.current = false;
        void loadProfile();
      }
      void refreshSecurityPreferences();
    }, [loadProfile, refreshSecurityPreferences]),
  );

  const closeEditor = () => {
    setEditMode(null);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setIsCurrentPwVisible(false);
    setIsNewPwVisible(false);
    setIsConfirmPwVisible(false);
  };

  const openProfileEditor = () => setEditMode('profile');
  const openPhoneGuidance = () => setEditMode('phone');
  const openPasswordEditor = () => setEditMode('password');

  /* ── 간편비밀번호(PIN) 로직 ── */
  const closePinModal = () => {
    setIsPinModalVisible(false);
    setPinModalMode('setup');
    setPinModalStep('create');
    setPinInput('');
    setPinDraft('');
    setPinError('');
  };

  const openPinEditor = () => {
    setPinError('');
    setPinInput('');
    setPinDraft('');
    setPinModalMode(securityPreferences.pinEnabled ? 'change' : 'setup');
    setPinModalStep(securityPreferences.pinEnabled ? 'verify-current' : 'create');
    setIsPinModalVisible(true);
  };

  const handleAppendPinDigit = async (digit: string) => {
    if (isPinSubmitting) return;
    const nextValue = `${pinInput}${digit}`.slice(0, 6);
    setPinInput(nextValue);

    if (nextValue.length === 6) {
      setIsPinSubmitting(true);
      try {
        if (pinModalStep === 'create' || pinModalStep === 'new') {
          setPinDraft(nextValue);
          setPinInput('');
          setPinModalStep(pinModalStep === 'create' ? 'confirm' : 'confirm-new');
        } else if (pinModalStep === 'verify-current') {
          const isValid = await verifyPinCode(nextValue, securityPreferences);
          if (!isValid) {
            setPinInput('');
            setPinError('현재 간편비밀번호가 올바르지 않아요.');
          } else {
            setPinInput('');
            if (pinModalMode === 'disable') {
              await removePinCode();
              Alert.alert('해제 완료', '간편비밀번호 사용이 해제되었습니다.');
              closePinModal();
            } else {
              setPinModalStep('new');
            }
          }
        } else if (nextValue === pinDraft) {
          await persistPinCode(nextValue);
          Alert.alert('설정 완료', '간편비밀번호가 안전하게 설정되었습니다.');
          closePinModal();
        } else {
          setPinInput('');
          setPinError('비밀번호가 일치하지 않아요. 다시 입력해주세요.');
          setPinModalStep(pinModalStep === 'confirm' ? 'create' : 'new');
        }
      } finally {
        setIsPinSubmitting(false);
      }
    }
  };

  /* ── 보안 설정 액션 ── */
  const handleToggleBiometric = async (enabled: boolean) => {
    if (isUpdatingSecurity) return;
    setIsUpdatingSecurity(true);
    try {
      if (enabled) {
        const result = await authenticateWithBiometrics('생체 인증 사용을 위해 본인 확인이 필요합니다.');
        if (!result.success) {
          Alert.alert('설정 실패', result.errorMessage || '인증에 실패했습니다.');
          return;
        }
      }
      await persistBiometricEnabled(enabled);
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleClearPinCode = () => {
    setPinModalMode('disable');
    setPinModalStep('verify-current');
    setIsPinModalVisible(true);
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (isNotificationSubmitting) return;

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
        console.warn('[MyPage] failed to sync notification token', fcmError);
      }

      setProfile((prev) => (prev ? { ...prev, alarmEnabled: updated.alarmEnabled } : prev));
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '알림 설정을 변경하지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('알림 설정 변경 실패', message);

      try {
        const latest = await getNotificationSettings();
        setProfile((prev) => (prev ? { ...prev, alarmEnabled: latest.alarmEnabled } : prev));
      } catch (reloadError) {
        console.warn('[MyPage] failed to reload notification settings', reloadError);
      }
    } finally {
      setIsNotificationSubmitting(false);
    }
  };

  /* ── 비밀번호 변경 처리 ── */
  const handlePasswordSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const validation = validatePassword(newPw, profile?.userId || undefined);
      if (!validation.isValid) throw new Error(validation.message);
      if (currentPw === newPw) throw new Error('현재 비밀번호와 동일합니다.');
      if (newPw !== confirmPw) throw new Error('새 비밀번호가 일치하지 않습니다.');

      await changePassword({ currentPw, newPw });
      Alert.alert('변경 완료', '비밀번호가 성공적으로 변경되었습니다.');
      closeEditor();
    } catch (error: any) {
      const presentation = buildAuthErrorPresentation(error, { 
        flow: 'password-reset', 
        fallbackMessage: '비밀번호 변경 중 문제가 발생했습니다.' 
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── 로그아웃 처리 ── */
  const handleLogout = () => {
    const shouldLogoutSsafy =
      (profile?.loginType ?? sessionLoginType) === 'SSAFY';

    Alert.alert(
      '로그아웃',
      shouldLogoutSsafy
        ? '로그아웃 후 SSAFY 브라우저 세션도 함께 종료됩니다.'
        : '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            let logoutError: unknown = null;

            try {
              try { await fcmService.unregisterFcmToken(); } catch (e) {}
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
                  console.warn('[MyPage] SSAFY browser logout failed:', error);
                });
              }, 0);
            }

            if (logoutError) {
              Alert.alert('로그아웃 안내', '서버 로그아웃 요청은 실패했지만, 현재 기기에서는 로그아웃 처리되었습니다.');
            }
          },
        },
      ],
    );
  };

  /**
   * 회원 탈퇴 화면으로 이동합니다.
   * - 일반 회원·SSAFY 회원 모두 SMS 본인 인증으로 통일합니다.
   * - WithdrawScreen 에서 SMS 인증 → 탈퇴 처리까지 모두 담당합니다.
   */
  const handleDeleteAccount = () => {
    if (!profile?.phoneNumber) {
      Alert.alert('회원 탈퇴 안내', '등록된 휴대폰 번호를 확인한 뒤 다시 시도해주세요.');
      return;
    }

    navigation.navigate('Withdraw', {
      phoneNumber: profile?.phoneNumber ?? '',
      name: profile?.name ?? '',
      birthDate: profile?.birthDate ?? '',
      gender: profile?.gender ?? '',
    });
  };

  const { displayName, sections } = useMyPageSections({
    profile,
    sessionUserName: sessionUser?.name,
    sessionLoginType,
    notificationEnabled: profile?.alarmEnabled ?? false,
    isNotificationSubmitting,
    securityPreferences,
    appVersion,
    onOpenProfile: openProfileEditor,
    onOpenPhoneGuidance: openPhoneGuidance,
    onOpenPassword: openPasswordEditor,
    onToggleNotifications: (enabled: boolean) => {
      void handleToggleNotifications(enabled);
    },
    onOpenPinEditor: openPinEditor,
    onToggleBiometric: (enabled: boolean) => {
      void handleToggleBiometric(enabled);
    },
    onClearPinCode: handleClearPinCode,
    onOpenTerms: () => setIsTermsModalVisible(true),
  });
  const latestAiClusterLabel = useMemo(() => {
    const clusterName = aiResultData?.report?.cluster?.name?.trim();

    if (!clusterName) {
      return null;
    }

    if (sessionUser?.userId && aiResultData?.ownerUserId && aiResultData.ownerUserId !== sessionUser.userId) {
      return null;
    }

    return clusterName;
  }, [aiResultData, sessionUser?.userId]);

  return (
    <>
      <BottomTabScreenLayout
        containerStyle={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}
        topDockStyle={{
          paddingHorizontal: pageHorizontal,
          paddingBottom: sectionGap * 0.45,
          backgroundColor: COLORS.backgroundSecondary,
        }}
        topDockTopPadding={topDockTopPadding}
        topDockContent={
          <MyPageProfileDockCard
            name={displayName}
            clusterLabel={latestAiClusterLabel}
            isLoading={isLoading}
          />
        }
        scrollViewStyle={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: pageHorizontal,
          gap: sectionGap,
        }}
        scrollTopPadding={scrollTopPadding + sectionGap * 0.25}
        scrollBottomPadding={scrollBottomPadding + sectionGap * 0.5}
      >
        {/* [LEGACY: Legacy Sections - Preserved for Reference]
          <View style={styles.profileSummaryRow}>
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>연결 계좌</Text>
              <Text style={styles.profileSummaryValue}>{profile?.phoneNumber ? '완료' : '준비중'}</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>온보딩</Text>
              <Text style={styles.profileSummaryValue}>{profile?.phoneNumber ? '완료' : '진행 중'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}><Text style={styles.statValue}>-</Text><Text style={styles.statLabel}>연결 계좌</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>-</Text><Text style={styles.statLabel}>카드</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>-</Text><Text style={styles.statLabel}>분석 상태</Text></View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>보유 카드</Text>
              <Text style={styles.sectionAction}>실연동 대기</Text>
            </View>
            <View style={styles.emptyStateCard}>
              <Ionicons name="card-outline" size={wp(24)} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>연결된 카드 데이터가 아직 없습니다.</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>연결 계좌</Text>
              <Text style={styles.sectionAction}>실연동 대기</Text>
            </View>
            <View style={styles.emptyStateCard}>
              <Ionicons name="wallet-outline" size={wp(24)} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>연결된 계좌 데이터가 아직 없습니다.</Text>
            </View>
          </View>
        */}

        {sections.map((section) => (
          <SettingSection key={section.key} title={section.title}>
            {section.items.map((item, index) => (
              <SettingItem key={`${section.key}-${item.label}-${index}`} {...item} />
            ))}
          </SettingSection>
        ))}

        <View>
          <MyPageActionButtons
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        </View>
      </BottomTabScreenLayout>

      <MyPageProfileInfoModal
        visible={editMode === 'profile'}
        name={profile?.name || '-'}
        gender={profile?.gender || '-'}
        birthDate={profile?.birthDate || '-'}
        onClose={closeEditor}
      />

      <MyPagePhoneGuidanceModal
        visible={editMode === 'phone'}
        phoneNumber={maskPhoneNumber(profile?.phoneNumber ?? '')}
        onClose={closeEditor}
        onStartVerification={() => {
          closeEditor();
          shouldRefreshProfileRef.current = true;
          navigation.navigate('PhoneUpdate', {
            phoneNumber: profile?.phoneNumber ?? '',
            name: profile?.name ?? '',
            birthDate: profile?.birthDate ?? '',
            gender: profile?.gender ?? '',
          });
        }}
      />

      <MyPagePasswordModal
        visible={editMode === 'password'}
        isSubmitting={isSubmitting}
        currentPw={currentPw}
        newPw={newPw}
        confirmPw={confirmPw}
        isCurrentPwVisible={isCurrentPwVisible}
        isNewPwVisible={isNewPwVisible}
        isConfirmPwVisible={isConfirmPwVisible}
        onClose={closeEditor}
        onSubmit={() => {
          void handlePasswordSubmit();
        }}
        onChangeCurrentPw={setCurrentPw}
        onChangeNewPw={setNewPw}
        onChangeConfirmPw={setConfirmPw}
        onToggleCurrentPwVisible={() => setIsCurrentPwVisible((prev) => !prev)}
        onToggleNewPwVisible={() => setIsNewPwVisible((prev) => !prev)}
        onToggleConfirmPwVisible={() => setIsConfirmPwVisible((prev) => !prev)}
      />

      <MyPagePinModal
        visible={isPinModalVisible}
        onClose={closePinModal}
        title={
          pinModalStep === 'create'
            ? '간편비밀번호 설정'
            : pinModalStep === 'confirm'
              ? '비밀번호 확인'
              : pinModalStep === 'verify-current'
                ? '현재 비밀번호 확인'
                : '새 비밀번호'
        }
        description={pinModalStep.includes('confirm') ? '한 번 더 입력해주세요.' : '6자리 숫자를 입력해주세요.'}
        pinInput={pinInput}
        pinError={pinError}
        onPressNumber={(digit) => {
          void handleAppendPinDigit(digit);
        }}
        onPressDelete={() => setPinInput((prev) => prev.slice(0, -1))}
      />

      {/* ── 약관 확인 모달 ── */}
      <AgreedTermsModal 
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      {/* 회원 탈퇴는 WithdrawScreen(별도 화면)에서 SMS 인증 후 처리됩니다 */}
    </>
  );
}
