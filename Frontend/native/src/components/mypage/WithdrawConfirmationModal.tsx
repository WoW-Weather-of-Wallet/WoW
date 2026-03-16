import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: wp(24),
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: wp(24),
    gap: hp(24),
  },
  header: {
    alignItems: 'center',
    gap: hp(12),
  },
  warningIconContainer: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(22),
  },
  inputSection: {
    gap: hp(12),
  },
  inputLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: hp(14),
    paddingHorizontal: wp(16),
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  inputActive: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: hp(16),
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: hp(16),
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
});
