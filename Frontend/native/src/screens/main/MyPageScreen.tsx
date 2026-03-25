import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { COLORS, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useLocalSecurityStore } from '../../store/localSecurityStore';
import { fcmService } from '../../services/fcmService';
import SecureKeypad from '../../components/common/SecureKeypad';
import SettingSection from '../../components/mypage/SettingSection';
import SettingItem from '../../components/mypage/SettingItem';
import AgreedTermsModal from '../../components/mypage/AgreedTermsModal';
import {
  changePassword,
  getProfile,
  getSsafyLogoutUrl,
  logout as logoutRequest,
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

import { styles } from './MyPageScreen.styles';

type EditMode = 'profile' | 'phone' | 'password' | null;
type PinModalStep = 'create' | 'confirm' | 'verify-current' | 'new' | 'confirm-new';
type PinModalMode = 'setup' | 'change' | 'disable';

const maskPhoneNumber = (phone: string) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * MyPageScreen (Settings Overhaul)
 * 마이페이지를 설정 중심으로 개편하되, 기존의 '사용자 분류 뱃지'를 프리미엄하게 통합합니다.
 * 보유 카드 및 연결 계좌 관련 코드는 주석 처리하여 보존합니다.
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const sessionUser = useAuthStore((state) => state.user);
  const sessionLoginType = useAuthStore((state) => state.loginType);
  const securityPreferences = useLocalSecurityStore((state) => state.preferences);
  const refreshSecurityPreferences = useLocalSecurityStore((state) => state.refreshPreferences);
  const persistBiometricEnabled = useLocalSecurityStore((state) => state.setBiometricEnabled);
  const persistPinCode = useLocalSecurityStore((state) => state.setPinCode);
  const removePinCode = useLocalSecurityStore((state) => state.clearPinCode);

  const [profile, setProfile] = useState<NativeUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
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
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // [Test] FCM 토큰 획득
  useEffect(() => {
    Notifications.getDevicePushTokenAsync()
      .then(result => setFcmToken(result.data))
      .catch(err => console.log('[FCM-Test] 토큰 획득 실패:', err));
  }, []);
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  // 약관 모달 상태
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? '1.0.0', []);

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

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
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
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

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

  const displayName = profile?.name ?? sessionUser?.name ?? '사용자';
  const displayBadge = profile?.loginType === 'SSAFY' ? 'SSAFY 회원' : '일반 회원';
  const displayInitial = displayName.slice(0, 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: tabBarHeight + hp(40),
          },
        ]}
      >
        {/* ── 사용자 프로필 헤더 (뱃지 통합) ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayInitial}</Text>
            </View>
            <View style={styles.profileTextBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  <Text style={styles.profileNameHighlight}>{displayName}</Text>님
                </Text>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>{displayBadge}</Text>
                </View>
              </View>
            </View>
          </View>

          {isLoading && (
            <View style={styles.profileLoadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.profileLoadingText}>정보를 불러오고 있어요...</Text>
            </View>
          )}
        </View>

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

        {/* ── 계정 정보 섹션 ── */}
        <SettingSection title="계정 정보">
          <SettingItem label="아이디" value={profile?.userId || '-'} type="text" />
          <SettingItem label="프로필 정보" value={displayName} onPress={openProfileEditor} />
          <SettingItem label="비밀번호 변경" onPress={openPasswordEditor} />
          <SettingItem 
            label="휴대폰 번호" 
            value={maskPhoneNumber(profile?.phoneNumber ?? '')} 
            onPress={openPhoneGuidance} 
          />
        </SettingSection>

        {/* ── 알림 및 보안 설정 ── */}
        <SettingSection title="알림 및 보안">
          <SettingItem 
            label="알림 상태" 
            value={profile?.alarmEnabled ? '사용 중' : '꺼짐'} 
            type="text" 
          />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleDescription}>모든 금융 알림을 수신합니다.</Text>
            <Switch
              value={profile?.alarmEnabled || false}
              disabled
              trackColor={{ false: COLORS.gray100, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
          <View style={{ height: hp(12) }} />
          <SettingItem
            label={securityPreferences.pinEnabled ? '간편비밀번호 변경' : '간편비밀번호 설정'}
            value={securityPreferences.pinEnabled ? '설정됨' : '미설정'}
            onPress={openPinEditor}
          />
          {securityPreferences.pinEnabled && (
            <>
              <SettingItem
                label="생체인증 사용"
                type="toggle"
                isToggled={securityPreferences.biometricEnabled}
                onToggle={handleToggleBiometric}
              />
              <SettingItem label="간편비밀번호 해제" isDanger onPress={handleClearPinCode} />
            </>
          )}
        </SettingSection>

        {/* ── 이용 안내 및 액션 ── */}
        <SettingSection title="이용 안내">
          <SettingItem label="동의한 약관 확인" onPress={() => setIsTermsModalVisible(true)} />
          <SettingItem label="현재 버전" value={appVersion} type="text" />
        </SettingSection>

        <View style={{ marginTop: hp(8), gap: hp(10) }}>
          <TouchableOpacity style={styles.readOnlyInput} onPress={handleLogout}>
            <Text style={[styles.readOnlyLabel, { color: COLORS.textPrimary }]}>로그아웃</Text>
            <Ionicons name="log-out-outline" size={wp(20)} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.readOnlyInput, { borderColor: COLORS.error + '30' }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.readOnlyLabel, { color: COLORS.error }]}>회원 탈퇴</Text>
            <Ionicons name="exit-outline" size={wp(20)} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* ── [Test] FCM 토큰 확인 섹션 (회원 탈퇴 아래) ── */}
        {fcmToken && (
          <View style={{ padding: wp(20), paddingBottom: hp(10), borderTopWidth: 1, borderTopColor: COLORS.gray100 }}>
            <Text style={{ fontSize: wp(12), color: COLORS.gray400, marginBottom: hp(8) }}>
              [테스트용] FCM 기기 토큰
            </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={async () => {
                await Clipboard.setStringAsync(fcmToken);
                Alert.alert('복사 완료', 'FCM 토큰이 클립보드에 복사되었습니다. 테스트 시 붙여넣기를 사용하세요.');
              }}
              style={{ 
                padding: wp(12), 
                backgroundColor: COLORS.gray50, 
                borderRadius: 8, 
                borderStyle: 'dashed', 
                borderWidth: 1, 
                borderColor: COLORS.gray200, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <Text numberOfLines={1} style={{ fontSize: wp(10), color: COLORS.gray500, flex: 1 }}>
                {fcmToken}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4), marginLeft: wp(8) }}>
                <Ionicons name="copy-outline" size={wp(14)} color={COLORS.primary} />
                <Text style={{ fontSize: wp(10), color: COLORS.primary, fontWeight: 'bold' }}>
                  복사하기
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── 프로필 정보 모달 ── */}
      <Modal visible={editMode === 'profile'} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={closeEditor}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>프로필 정보</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyLabel}>이름</Text>
              <Text style={styles.readOnlyValue}>{profile?.name || '-'}</Text>
            </View>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyLabel}>성별</Text>
              <Text style={styles.readOnlyValue}>{profile?.gender === 'M' ? '남성' : '여성'}</Text>
            </View>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyLabel}>생년월일</Text>
              <Text style={styles.readOnlyValue}>{profile?.birthDate || '-'}</Text>
            </View>
            <Text style={styles.readOnlyHint}>* 가입 시 본인인증을 통해 확인된 정보입니다.</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={closeEditor}>
                <Text style={styles.primaryButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── 휴대폰 번호 모달 ── */}
      <Modal visible={editMode === 'phone'} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={closeEditor}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>휴대폰 번호 변경</Text>
            <Text style={styles.modalDescription}>
              현재 등록된 번호를 확인한 뒤, 새 번호로 본인 인증을 진행해 주세요.
            </Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyLabel}>현재 번호</Text>
              <Text style={styles.readOnlyValue}>{maskPhoneNumber(profile?.phoneNumber ?? '')}</Text>
            </View>
            
            <View style={styles.hyperlinkContainer}>
              <Text style={styles.hyperlinkText}>
                새 휴대폰 번호로 인증번호를 받아 본인 확인을 완료하면 번호를 변경할 수 있습니다.
              </Text>
              <Text style={[styles.readOnlyHint, { textAlign: 'left', marginTop: hp(8) }]}>
                이름, 생년월일, 성별 정보는 가입 시 확인된 내용으로 고정됩니다.
              </Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={closeEditor}
              >
                <Text style={styles.secondaryButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  closeEditor();
                  navigation.navigate('PhoneUpdate', {
                    phoneNumber: profile?.phoneNumber ?? '',
                    name: profile?.name ?? '',
                    birthDate: profile?.birthDate ?? '',
                    gender: profile?.gender ?? '',
                  });
                }}
              >
                <Text style={styles.primaryButtonText}>본인 인증하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── 비밀번호 변경 모달 ── */}
      <Modal visible={editMode === 'password'} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={closeEditor}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="현재 비밀번호"
                secureTextEntry={!isCurrentPwVisible}
                value={currentPw}
                onChangeText={setCurrentPw}
              />
              <TouchableOpacity style={styles.inputEyeIcon} onPress={() => setIsCurrentPwVisible(!isCurrentPwVisible)}>
                <Ionicons name={isCurrentPwVisible ? 'eye-outline' : 'eye-off-outline'} size={wp(20)} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="새 비밀번호 (8자 이상)"
                secureTextEntry={!isNewPwVisible}
                value={newPw}
                onChangeText={setNewPw}
              />
              <TouchableOpacity style={styles.inputEyeIcon} onPress={() => setIsNewPwVisible(!isNewPwVisible)}>
                <Ionicons name={isNewPwVisible ? 'eye-outline' : 'eye-off-outline'} size={wp(20)} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="비밀번호 확인"
                secureTextEntry={!isConfirmPwVisible}
                value={confirmPw}
                onChangeText={setConfirmPw}
              />
              <TouchableOpacity style={styles.inputEyeIcon} onPress={() => setIsConfirmPwVisible(!isConfirmPwVisible)}>
                <Ionicons name={isConfirmPwVisible ? 'eye-outline' : 'eye-off-outline'} size={wp(20)} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalButtonRow, { gap: wp(8) }]}>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.gray100 }]} onPress={closeEditor}>
                <Text style={[styles.primaryButtonText, { color: COLORS.textPrimary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSubmit}>
                <Text style={styles.primaryButtonText}>{isSubmitting ? '변경 중...' : '변경하기'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── 간편비밀번호(PIN) 모달 ── */}
      <Modal visible={isPinModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.pinModalCard}>
            <Text style={styles.modalTitle}>
              {pinModalStep === 'create' ? '간편비밀번호 설정' : 
               pinModalStep === 'confirm' ? '비밀번호 확인' :
               pinModalStep === 'verify-current' ? '현재 비밀번호 확인' : '새 비밀번호'}
            </Text>
            <Text style={styles.pinModalDescription}>
              {pinModalStep.includes('confirm') ? '한 번 더 입력해주세요.' : '6자리 숫자를 입력해주세요.'}
            </Text>
            <View style={styles.pinIndicatorRow}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={[styles.pinIndicatorDot, i < pinInput.length && styles.pinIndicatorDotFilled]} />
              ))}
            </View>
            {pinError ? <Text style={styles.errorMessage}>{pinError}</Text> : null}
            <SecureKeypad
              onPressNumber={handleAppendPinDigit}
              onPressDelete={() => setPinInput(prev => prev.slice(0, -1))}
            />
          </View>
        </View>
      </Modal>

      {/* ── 약관 확인 모달 ── */}
      <AgreedTermsModal 
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      {/* 회원 탈퇴는 WithdrawScreen(별도 화면)에서 SMS 인증 후 처리됩니다 */}
    </View>
  );
}
