import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPagePhoneGuidanceModalProps {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onStartVerification: () => void;
}

export default function MyPagePhoneGuidanceModal({
  visible,
  phoneNumber,
  onClose,
  onStartVerification,
}: MyPagePhoneGuidanceModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>휴대폰 번호 변경</Text>
          <Text style={styles.modalDescription}>
            현재 등록된 번호를 확인한 뒤, 새 번호로 본인 인증을 진행해 주세요.
          </Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyLabel}>현재 번호</Text>
            <Text style={styles.readOnlyValue}>{phoneNumber}</Text>
          </View>

          <View style={styles.hyperlinkContainer}>
            <Text style={styles.hyperlinkText}>
              새 휴대폰 번호로 인증번호를 받아 본인 확인을 완료하면 번호를 변경할 수 있습니다.
            </Text>
            <Text style={[styles.readOnlyHint, { textAlign: 'left', marginTop: 8 }]}>
              이름, 생년월일, 성별 정보는 가입 시 확인된 내용으로 고정됩니다.
            </Text>
          </View>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onStartVerification}>
              <Text style={styles.primaryButtonText}>본인 인증하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
