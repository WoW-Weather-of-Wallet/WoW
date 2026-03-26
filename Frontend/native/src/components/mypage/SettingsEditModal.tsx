import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fp, hp, wp } from '../../constants/theme';
import { validatePassword } from '../../utils/validation';
import { styles } from '../../screens/mypage/SettingsScreen.styles';

type EditMode = 'profile' | 'password' | null;

interface SettingsEditModalProps {
  visible: boolean;
  editMode: EditMode;
  isSubmitting: boolean;
  name: string;
  gender: string;
  birthDate: string;
  currentPw: string;
  newPw: string;
  confirmPw: string;
  userId?: string | null;
  isCurrentPwVisible: boolean;
  isNewPwVisible: boolean;
  isConfirmPwVisible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeCurrentPw: (value: string) => void;
  onChangeNewPw: (value: string) => void;
  onChangeConfirmPw: (value: string) => void;
  onToggleCurrentPwVisible: () => void;
  onToggleNewPwVisible: () => void;
  onToggleConfirmPwVisible: () => void;
}

export default function SettingsEditModal({
  visible,
  editMode,
  isSubmitting,
  name,
  gender,
  birthDate,
  currentPw,
  newPw,
  confirmPw,
  userId,
  isCurrentPwVisible,
  isNewPwVisible,
  isConfirmPwVisible,
  onClose,
  onSubmit,
  onChangeCurrentPw,
  onChangeNewPw,
  onChangeConfirmPw,
  onToggleCurrentPwVisible,
  onToggleNewPwVisible,
  onToggleConfirmPwVisible,
}: SettingsEditModalProps) {
  const passwordValidation = validatePassword(newPw, userId || undefined);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.modalTitle}>
            {editMode === 'profile' ? '프로필 정보 수정' : '비밀번호 변경'}
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
              <Text style={styles.readOnlyHint}>
                * 프로필 정보는 본인확인 기준 데이터라 앱에서 직접 수정할 수 없어요.
              </Text>
            </>
          ) : null}

          {editMode === 'password' ? (
            <>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="현재 비밀번호"
                  placeholderTextColor={COLORS.textTertiary}
                  value={currentPw}
                  onChangeText={onChangeCurrentPw}
                  secureTextEntry={!isCurrentPwVisible}
                />
                <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleCurrentPwVisible}>
                  <Ionicons
                    name={isCurrentPwVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={wp(22)}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="새 비밀번호 (8~20자, 영문/숫자/특수문자)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={newPw}
                  onChangeText={onChangeNewPw}
                  secureTextEntry={!isNewPwVisible}
                />
                <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleNewPwVisible}>
                  <Ionicons
                    name={isNewPwVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={wp(22)}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {newPw.length > 0 ? (
                <Text
                  style={[
                    styles.errorMessage,
                    { marginTop: 0, marginBottom: hp(8), fontSize: fp(12) },
                    passwordValidation.isValid ? { color: COLORS.success } : null,
                  ]}
                >
                  * {passwordValidation.message}
                </Text>
              ) : null}

              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="새 비밀번호 확인"
                  placeholderTextColor={COLORS.textTertiary}
                  value={confirmPw}
                  onChangeText={onChangeConfirmPw}
                  secureTextEntry={!isConfirmPwVisible}
                />
                <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleConfirmPwVisible}>
                  <Ionicons
                    name={isConfirmPwVisible ? 'eye-outline' : 'eye-off-outline'}
                    size={wp(22)}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
