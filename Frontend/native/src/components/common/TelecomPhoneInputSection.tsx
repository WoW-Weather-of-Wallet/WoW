import React, { type Ref } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AuthUnderlineInput from './AuthUnderlineInput';

export interface TelecomPhoneInputSectionProps {
  telecom: string;
  telecomPlaceholder: string;
  phone: string;
  onOpenTelecomModal: () => void;
  onPhoneChange: (value: string) => void;
  phonePlaceholder: string;
  selectorStyle: StyleProp<ViewStyle>;
  telecomTextStyle: StyleProp<TextStyle>;
  placeholderTextStyle?: StyleProp<TextStyle>;
  phoneInputContainerStyle: StyleProp<ViewStyle>;
  phoneInputStyle: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  errorText?: string;
  phoneInputRef?: Ref<TextInput>;
  phoneVisible?: boolean;
  animatePhoneInput?: boolean;
  chevronIconSize: number;
  chevronIconColor: string;
  placeholderTextColor: string;
  phoneMaxLength?: number;
}

export default function TelecomPhoneInputSection({
  telecom,
  telecomPlaceholder,
  phone,
  onOpenTelecomModal,
  onPhoneChange,
  phonePlaceholder,
  selectorStyle,
  telecomTextStyle,
  placeholderTextStyle,
  phoneInputContainerStyle,
  phoneInputStyle,
  errorTextStyle,
  errorText = '',
  phoneInputRef,
  phoneVisible = true,
  animatePhoneInput = false,
  chevronIconSize,
  chevronIconColor,
  placeholderTextColor,
  phoneMaxLength = 11,
}: TelecomPhoneInputSectionProps) {
  const phoneInput = (
    <AuthUnderlineInput
      ref={phoneInputRef}
      containerStyle={phoneInputContainerStyle}
      inputStyle={phoneInputStyle}
      value={phone}
      onChangeText={onPhoneChange}
      placeholder={phonePlaceholder}
      placeholderTextColor={placeholderTextColor}
      keyboardType="number-pad"
      maxLength={phoneMaxLength}
    />
  );

  return (
    <>
      <TouchableOpacity style={selectorStyle} onPress={onOpenTelecomModal}>
        <Text
          style={[
            telecomTextStyle,
            telecom === telecomPlaceholder && placeholderTextStyle,
          ]}
        >
          {telecom}
        </Text>
        <Ionicons
          name="chevron-down"
          size={chevronIconSize}
          color={chevronIconColor}
        />
      </TouchableOpacity>

      {phoneVisible ? (
        animatePhoneInput ? (
          <Animated.View entering={FadeInDown.duration(350)}>
            {phoneInput}
          </Animated.View>
        ) : (
          phoneInput
        )
      ) : null}

      {errorText.length > 0 ? (
        <Text style={errorTextStyle}>{errorText}</Text>
      ) : null}
    </>
  );
}
