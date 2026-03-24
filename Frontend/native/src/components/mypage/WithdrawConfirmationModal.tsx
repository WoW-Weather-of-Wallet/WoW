import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { sendSmsCode, verifySmsCode, normalizePhoneNumber } from '../../services/auth';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface WithdrawConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  /** SMS 인증까지 완료한 뒤 탈퇴 API를 호출하는 콜백 */
  onConfirm: () => void;
  /** 인증번호를 발송할 등록된 휴대폰 번호 (raw) */
  phoneNumber: string;
}

// ─────────────────────────────────────────────
// 유틸: 휴대폰 번호 마스킹 (01012345678 → 010-****-5678)
// ─────────────────────────────────────────────

const maskPhoneNumber = (phone: string): string => {
  // 번호가 없으면 빈 문자열로 안전하게 처리 (프로필 로딩 전 undefined 방어)
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
  return phone;
};

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────

export default function WithdrawConfirmationModal({
  visible,
  onClose,
  onConfirm,
  // 프로필 로딩 완료 전 undefined가 들어올 수 있으므로 기본값 설정
  phoneNumber = '',
}: WithdrawConfirmationModalProps) {
  // 입력된 SMS 인증번호
  const [code, setCode] = useState('');
  // 인증번호 발송 완료 여부
  const [isCodeSent, setIsCodeSent] = useState(false);
  // SMS 본인 확인 완료 여부
  const [isVerified, setIsVerified] = useState(false);
  // SMS 발송 요청 중 여부
  const [isSending, setIsSending] = useState(false);
  // 인증번호 검증 요청 중 여부
  const [isVerifying, setIsVerifying] = useState(false);

  const maskedPhone = maskPhoneNumber(phoneNumber);

  /** 모달 닫기: 내부 상태를 초기화하고 부모 콜백 호출 */
  const handleClose = () => {
    setCode('');
    setIsCodeSent(false);
    setIsVerified(false);
    setIsSending(false);
    setIsVerifying(false);
    onClose();
  };

  /** 인증번호 발송 요청 */
  const handleSendCode = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await sendSmsCode({ phoneNumber: normalizePhoneNumber(phoneNumber) });
      setIsCodeSent(true);
      setIsVerified(false);
      setCode('');
      Alert.alert('인증번호 발송', `${maskedPhone}으로 인증번호를 전송했습니다.`);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: '인증번호를 보내지 못했어요. 다시 시도해주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSending(false);
    }
  };

  /** 인증번호 확인 요청 */
  const handleVerifyCode = async () => {
    if (isVerifying || code.trim().length !== 6) return;
    setIsVerifying(true);
    try {
      await verifySmsCode({
        phoneNumber: normalizePhoneNumber(phoneNumber),
        code: code.trim(),
      });
      setIsVerified(true);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-verify',
        fallbackMessage: '인증번호가 올바르지 않아요. 다시 확인해주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  /** 탈퇴 확정: 본인 확인 완료 후에만 가능 */
  const handleConfirm = () => {
    if (!isVerified) return;
    onConfirm();
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>

            {/* ── 경고 헤더 ── */}
            <View style={styles.header}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={wp(32)} color={COLORS.error} />
              </View>
              <Text style={styles.title}>정말 떠나시나요?</Text>
              <Text style={styles.description}>
                계정을 삭제하면 모든 자산 정보, 거래 내역, 설정이{'\n'}
                즉시 삭제되며 복구할 수 없습니다.
              </Text>
            </View>

            {/* ── SMS 본인 인증 안내 + 발송 버튼 ── */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {'등록된 번호 '}
                <Text style={styles.boldText}>{maskedPhone}</Text>
                {'\n'}으로 인증번호를 발송해 본인 확인을 진행합니다.
              </Text>
              <TouchableOpacity
                style={[styles.sendCodeButton, isSending && styles.disabledButton]}
                onPress={() => void handleSendCode()}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.sendCodeButtonText}>
                    {isCodeSent ? '인증번호 다시 발송' : '인증번호 발송'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── 인증번호 입력 영역 (발송 후 표시) ── */}
            {isCodeSent ? (
              <View style={styles.inputSection}>
                <TextInput
                  style={[styles.input, isVerified && styles.inputActive]}
                  placeholder="인증번호 6자리 입력"
                  placeholderTextColor={COLORS.textTertiary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isVerified}
                />

                {/* 인증 전: 확인 버튼 / 인증 후: 완료 메시지 */}
                {isVerified ? (
                  <Text style={styles.verifiedText}>✓ 본인 확인이 완료되었습니다.</Text>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      (code.length !== 6 || isVerifying) && styles.disabledButton,
                    ]}
                    onPress={() => void handleVerifyCode()}
                    disabled={code.length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.confirmButtonText}>인증번호 확인</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {/* ── 취소 / 탈퇴하기 버튼 ── */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !isVerified && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={!isVerified}
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
