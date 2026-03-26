import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  TELECOM_OPTIONS,
  TELECOM_PLACEHOLDER,
} from '../../constants/auth/identityVerification';

interface TelecomSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title?: string;
  options?: readonly string[];
  bottomInset?: number;
  overlayStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
}

export default function TelecomSelectModal({
  visible,
  onClose,
  onSelect,
  title = TELECOM_PLACEHOLDER,
  options = TELECOM_OPTIONS,
  bottomInset = 0,
  overlayStyle,
  contentStyle,
  headerStyle,
  titleStyle,
  itemStyle,
  itemTextStyle,
}: TelecomSelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={overlayStyle} onPress={onClose}>
        <View style={contentStyle}>
          <View style={headerStyle}>
            <Text style={titleStyle}>{title}</Text>
          </View>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              style={itemStyle}
              onPress={() => onSelect(item)}
            >
              <Text style={itemTextStyle}>{item}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: bottomInset }} />
        </View>
      </Pressable>
    </Modal>
  );
}
