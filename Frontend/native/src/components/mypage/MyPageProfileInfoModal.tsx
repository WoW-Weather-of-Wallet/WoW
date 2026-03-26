import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPageProfileInfoModalProps {
  visible: boolean;
  name: string;
  gender: string;
  birthDate: string;
  onClose: () => void;
}

export default function MyPageProfileInfoModal({
  visible,
  name,
  gender,
  birthDate,
  onClose,
}: MyPageProfileInfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>프로필 정보</Text>
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
          <Text style={styles.readOnlyHint}>* 가입 시 본인인증을 통해 확인된 정보입니다.</Text>
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
