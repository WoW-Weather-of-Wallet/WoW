import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import SecureKeypad from '../../components/common/SecureKeypad';
import { styles } from '../../screens/mypage/SettingsScreen.styles';

interface SettingsPinModalProps {
  visible: boolean;
  title: string;
  description: string;
  pinInput: string;
  pinError: string;
  onClose: () => void;
  onPressNumber: (digit: string) => void;
  onPressDelete: () => void;
}

export default function SettingsPinModal({
  visible,
  title,
  description,
  pinInput,
  pinError,
  onClose,
  onPressNumber,
  onPressDelete,
}: SettingsPinModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.pinModalCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.pinModalDescription}>{description}</Text>

          <View style={styles.pinIndicatorRow}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={`settings-pin-dot-${index}`}
                style={[
                  styles.pinIndicatorDot,
                  index < pinInput.length && styles.pinIndicatorDotFilled,
                ]}
              />
            ))}
          </View>

          {pinError ? <Text style={styles.errorMessage}>{pinError}</Text> : null}

          <SecureKeypad
            onPressNumber={onPressNumber}
            onPressDelete={onPressDelete}
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
