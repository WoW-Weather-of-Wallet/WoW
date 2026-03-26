import React from 'react';
import { Modal, Text, View } from 'react-native';
import SecureKeypad from '../common/SecureKeypad';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPagePinModalProps {
  visible: boolean;
  title: string;
  description: string;
  pinInput: string;
  pinError: string;
  onPressNumber: (digit: string) => void;
  onPressDelete: () => void;
}

export default function MyPagePinModal({
  visible,
  title,
  description,
  pinInput,
  pinError,
  onPressNumber,
  onPressDelete,
}: MyPagePinModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.pinModalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.pinModalDescription}>{description}</Text>
          <View style={styles.pinIndicatorRow}>
            {[...Array(6)].map((_, index) => (
              <View
                key={`mypage-pin-dot-${index}`}
                style={[
                  styles.pinIndicatorDot,
                  index < pinInput.length && styles.pinIndicatorDotFilled,
                ]}
              />
            ))}
          </View>
          {pinError ? <Text style={styles.errorMessage}>{pinError}</Text> : null}
          <SecureKeypad onPressNumber={onPressNumber} onPressDelete={onPressDelete} />
        </View>
      </View>
    </Modal>
  );
}
