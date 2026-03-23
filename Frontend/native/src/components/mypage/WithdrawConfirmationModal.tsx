import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './WithdrawConfirmationModal.styles';

interface WithdrawConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function WithdrawConfirmationModal({
  visible,
  onClose,
  onConfirm,
}: WithdrawConfirmationModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const isConfirmEnabled = 
    password.length >= 8 && 
    password === confirmPassword;

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setIsPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
    onClose();
  };

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm(password);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={wp(32)} color={COLORS.error} />
              </View>
              <Text style={styles.title}>정말 떠나시나요?</Text>
              <Text style={styles.description}>
                계정을 삭제하면 모든 자산 정보, 거래 내역, 설정이{'\n'}즉시 삭제되며 복구할 수 없습니다.
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>현재 비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, textAlign: 'left' }, password.length >= 8 && styles.inputActive]}
                  placeholder="현재 비밀번호 입력"
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                    size={wp(20)} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>비밀번호 확인</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input, 
                    { flex: 1, textAlign: 'left' }, 
                    confirmPassword.length >= 8 && password === confirmPassword && styles.inputActive,
                    confirmPassword.length > 0 && password !== confirmPassword && styles.inputError
                  ]}
                  placeholder="비밀번호 한 번 더 입력"
                  placeholderTextColor={COLORS.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <Ionicons 
                    name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                    size={wp(20)} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !isConfirmEnabled && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={!isConfirmEnabled}
              >
                <Text style={styles.confirmButtonText}>탈퇴하기</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

