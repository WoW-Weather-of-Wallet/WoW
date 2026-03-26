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
import { COLORS, wp } from '../../constants/theme';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPagePasswordModalProps {
  visible: boolean;
  isSubmitting: boolean;
  currentPw: string;
  newPw: string;
  confirmPw: string;
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

export default function MyPagePasswordModal({
  visible,
  isSubmitting,
  currentPw,
  newPw,
  confirmPw,
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
}: MyPagePasswordModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>비밀번호 변경</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="현재 비밀번호"
              secureTextEntry={!isCurrentPwVisible}
              value={currentPw}
              onChangeText={onChangeCurrentPw}
            />
            <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleCurrentPwVisible}>
              <Ionicons
                name={isCurrentPwVisible ? 'eye-outline' : 'eye-off-outline'}
                size={wp(20)}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="새 비밀번호 (8자 이상)"
              secureTextEntry={!isNewPwVisible}
              value={newPw}
              onChangeText={onChangeNewPw}
            />
            <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleNewPwVisible}>
              <Ionicons
                name={isNewPwVisible ? 'eye-outline' : 'eye-off-outline'}
                size={wp(20)}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="비밀번호 확인"
              secureTextEntry={!isConfirmPwVisible}
              value={confirmPw}
              onChangeText={onChangeConfirmPw}
            />
            <TouchableOpacity style={styles.inputEyeIcon} onPress={onToggleConfirmPwVisible}>
              <Ionicons
                name={isConfirmPwVisible ? 'eye-outline' : 'eye-off-outline'}
                size={wp(20)}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.modalButtonRow, { gap: wp(8) }]}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: COLORS.gray100 }]}
              onPress={onClose}
            >
              <Text style={[styles.primaryButtonText, { color: COLORS.textPrimary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onSubmit}>
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? '변경 중...' : '변경하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
