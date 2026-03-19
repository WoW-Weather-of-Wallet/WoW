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
  onConfirm: () => void;
}

/**
 * 회원 탈퇴 시 '탈퇴하기' 문구를 직접 입력받아 실수로 탈퇴하는 것을 방지하는 2차 확인 모달입니다.
 */
export default function WithdrawConfirmationModal({
  visible,
  onClose,
  onConfirm,
}: WithdrawConfirmationModalProps) {
  const [inputText, setInputText] = useState('');
  const isConfirmEnabled = inputText === '탈퇴하기';

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm();
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
              <Text style={styles.inputLabel}>
                확인을 위해 아래에 <Text style={styles.boldText}>'탈퇴하기'</Text>를 입력해주세요.
              </Text>
              <TextInput
                style={[styles.input, isConfirmEnabled && styles.inputActive]}
                placeholder="탈퇴하기"
                placeholderTextColor={COLORS.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
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

