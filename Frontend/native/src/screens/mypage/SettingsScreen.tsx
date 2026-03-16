import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import ProfileEditHeader from '../../components/mypage/ProfileEditHeader';
import SettingSection from '../../components/mypage/SettingSection';
import SettingItem from '../../components/mypage/SettingItem';
import AgreedTermsModal from '../../components/mypage/AgreedTermsModal';
import WithdrawConfirmationModal from '../../components/mypage/WithdrawConfirmationModal';
import {
  changePassword,
  deleteAccount,
  getProfile,
  logout as logoutRequest,
  sendSmsCode,
  updatePhone,
  updateProfile,
  verifySmsCode,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

type EditMode = 'profile' | 'phone' | 'password' | null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [profile, setProfile] = useState<NativeUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isPhoneCodeSent, setIsPhoneCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);

  const appVersion = useMemo(() => Constants.expoConfig?.version ?? 'unknown', []);
  const isPushEnabled = profile?.alarmEnabled ?? false;

  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getProfile();
      setProfile(response);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '설정 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
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

  const resetForm = () => {
    setName('');
    setGender('');
    setBirthDate('');
    setPhoneNumber('');
    setPhoneCode('');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setIsPhoneCodeSent(false);
    setIsPhoneVerified(false);
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
    setPhoneNumber(profile?.phoneNumber ?? '');
    setPhoneCode('');
    setIsPhoneCodeSent(false);
    setIsPhoneVerified(false);
    setEditMode('phone');
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

  const handleSendPhoneCode = async () => {
    const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');

    if (isSubmitting || normalizedPhone.length < 10) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendSmsCode({ phoneNumber: normalizedPhone });
      setIsPhoneCodeSent(true);
      setIsPhoneVerified(false);
      Alert.alert('인증번호 발송', '인증번호를 문자로 전송했습니다.');
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '인증번호를 보내지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('인증번호 발송 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '');

    if (isSubmitting || !isPhoneCodeSent || phoneCode.trim().length !== 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      await verifySmsCode({
        phoneNumber: normalizedPhone,
        code: phoneCode.trim(),
      });
      setIsPhoneVerified(true);
      Alert.alert('인증 완료', '휴대폰 번호 인증이 완료되었습니다.');
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '인증번호를 확인하지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('인증 실패', message);
    } finally {
      setIsSubmitting(false);
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

      if (editMode === 'phone') {
        if (!isPhoneVerified) {
          throw new Error('휴대폰 번호 변경 전에 SMS 인증을 완료해주세요.');
        }

        await updatePhone({
          phoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
        });
        await loadProfile();
      }

      if (editMode === 'password') {
        if (currentPw === newPw) {
          throw new Error('현재 비밀번호와 다른 새 비밀번호를 입력해주세요.');
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
      const message = extractApiErrorMessage(
        error,
        editMode === 'password'
          ? '비밀번호를 변경하지 못했어요.'
          : '설정 변경을 저장하지 못했어요.',
      );
      Alert.alert('설정 저장 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutRequest();
          } catch (error) {
            const message = extractApiErrorMessage(
              error,
              '로그아웃 처리 중 문제가 있었어요. 다시 시도해주세요.',
            );
            Alert.alert('로그아웃 실패', message);
            return;
          }

          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    setIsWithdrawModalVisible(true);
  };

  const onConfirmWithdraw = async () => {
    setIsSubmitting(true);
    try {
      await deleteAccount();
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '회원 탈퇴를 처리하지 못했어요. 다시 시도해주세요.',
      );
      Alert.alert('회원 탈퇴 실패', message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const pushToggleDescription = isPushEnabled ? '켜짐' : '꺼짐';
  const userIdentifier =
    profile?.userId ?? (profile?.loginType === 'SSAFY' ? 'SSAFY 로그인' : '-');
  const phoneDisplay = profile?.phoneNumber ?? '미등록';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용자 설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileEditHeader
          name={profile?.name ?? '사용자'}
          onEditPress={handleEditProfilePhoto}
        />

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>설정 정보를 불러오는 중입니다.</Text>
          </View>
        ) : null}

        <SettingSection title="계정 정보">
          <SettingItem label="아이디" value={userIdentifier} type="text" />
          <SettingItem
            label="프로필 정보 수정"
            value={profile?.name ?? '-'}
            onPress={openProfileEditor}
          />
          <SettingItem label="비밀번호 변경" onPress={openPasswordEditor} />
          <SettingItem label="휴대폰 번호" value={phoneDisplay} onPress={openPhoneEditor} />
        </SettingSection>

        <SettingSection title="서비스 설정">
          <SettingItem label="알림 상태" value={pushToggleDescription} type="text" />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleDescription}>
              알림 설정 변경 API는 아직 준비되지 않아 현재 상태만 표시합니다.
            </Text>
            <Switch
              value={isPushEnabled}
              disabled
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </SettingSection>

        <SettingSection title="이용 안내">
          <SettingItem
            label="동의한 약관 확인"
            onPress={() => setIsTermsModalVisible(true)}
          />
          <SettingItem label="현재 버전" value={appVersion} type="text" />
        </SettingSection>


        <SettingSection>
          <SettingItem label="로그아웃" onPress={handleLogout} />
          <SettingItem label="회원 탈퇴" isDanger onPress={handleDeleteAccount} />
        </SettingSection>

        <View style={{ height: hp(40) }} />
      </ScrollView>

      <Modal
        visible={editMode !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeEditor}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {editMode === 'profile'
                ? '프로필 정보 수정'
                : editMode === 'phone'
                  ? '휴대폰 번호 수정'
                  : '비밀번호 변경'}
            </Text>

            {editMode === 'profile' ? (
              <>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyLabel}>이름</Text>
                  <Text style={styles.readOnlyValue}>{name}</Text>
                </View>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyLabel}>성별</Text>
                  <Text style={styles.readOnlyValue}>{gender === 'M' ? '남성' : '여성'}</Text>
                </View>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyLabel}>생년월일</Text>
                  <Text style={styles.readOnlyValue}>{birthDate}</Text>
                </View>
                <Text style={styles.readOnlyHint}>* 기본 정보는 본인인증을 통해 확인된 정보라 직접 수정할 수 없어요.</Text>
              </>
            ) : null}


            {editMode === 'phone' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="휴대폰 번호 (- 없이 입력)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={phoneNumber}
                  onChangeText={(value) => {
                    setPhoneNumber(value);
                    setIsPhoneVerified(false);
                  }}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.inlineActionButton, styles.secondaryInlineActionButton]}
                  onPress={() => void handleSendPhoneCode()}
                  disabled={isSubmitting}
                >
                  <Text style={styles.secondaryInlineActionText}>
                    {isPhoneCodeSent ? '인증번호 다시 발송' : '인증번호 발송'}
                  </Text>
                </TouchableOpacity>

                {isPhoneCodeSent ? (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="인증번호 6자리"
                      placeholderTextColor={COLORS.textTertiary}
                      value={phoneCode}
                      onChangeText={setPhoneCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={[
                        styles.inlineActionButton,
                        isPhoneVerified && styles.verifiedInlineActionButton,
                      ]}
                      onPress={() => void handleVerifyPhoneCode()}
                      disabled={isSubmitting || isPhoneVerified}
                    >
                      <Text style={styles.inlineActionText}>
                        {isPhoneVerified ? '인증 완료' : '인증번호 확인'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </>
            ) : null}

            {editMode === 'password' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="현재 비밀번호"
                  placeholderTextColor={COLORS.textTertiary}
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="새 비밀번호"
                  placeholderTextColor={COLORS.textTertiary}
                  value={newPw}
                  onChangeText={setNewPw}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="새 비밀번호 확인"
                  placeholderTextColor={COLORS.textTertiary}
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry
                />
              </>
            ) : null}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeEditor}>
                <Text style={styles.secondaryButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => void handleSubmit()}>
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <AgreedTermsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      <WithdrawConfirmationModal
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        onConfirm={onConfirmWithdraw}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56) + 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },
  scrollContent: {
    paddingBottom: hp(20),
  },
  loadingCard: {
    marginTop: hp(20),
    paddingVertical: hp(20),
    alignItems: 'center',
    gap: hp(10),
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingBottom: hp(16),
    backgroundColor: COLORS.background,
    gap: wp(12),
  },
  toggleDescription: {
    flex: 1,
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: wp(20),
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: wp(20),
    gap: hp(12),
  },
  modalTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  readOnlyLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
  readOnlyValue: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  readOnlyHint: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: hp(4),
    paddingHorizontal: wp(4),
  },
  inlineActionButton: {

    borderRadius: RADIUS.md,
    paddingVertical: hp(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  secondaryInlineActionButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifiedInlineActionButton: {
    backgroundColor: COLORS.success,
  },
  inlineActionText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
  secondaryInlineActionText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(10),
    marginTop: hp(8),
  },
  secondaryButton: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  secondaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
});
