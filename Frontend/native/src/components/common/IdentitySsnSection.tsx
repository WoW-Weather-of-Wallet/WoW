import React, { type Ref } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import AuthUnderlineInput from './AuthUnderlineInput';

export interface IdentitySsnSectionProps {
  frontValue: string;
  backValue: string;
  onFrontChange?: (value: string) => void;
  onBackChange?: (value: string) => void;
  frontInputRef?: Ref<TextInput>;
  backInputRef?: Ref<TextInput>;
  containerStyle: StyleProp<ViewStyle>;
  frontContainerStyle: StyleProp<ViewStyle>;
  frontValueStyle: StyleProp<TextStyle>;
  backContainerStyle: StyleProp<ViewStyle>;
  backValueStyle: StyleProp<TextStyle>;
  dashStyle: StyleProp<TextStyle>;
  maskingTextStyle: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  frontPlaceholder?: string;
  backPlaceholder?: string;
  frontMaxLength?: number;
  backMaxLength?: number;
  frontEditable?: boolean;
  backEditable?: boolean;
  frontDisplayValue?: string;
  backDisplayValue?: string;
  backMaskingText?: string;
}

export default function IdentitySsnSection({
  frontValue,
  backValue,
  onFrontChange,
  onBackChange,
  frontInputRef,
  backInputRef,
  containerStyle,
  frontContainerStyle,
  frontValueStyle,
  backContainerStyle,
  backValueStyle,
  dashStyle,
  maskingTextStyle,
  placeholderTextColor,
  frontPlaceholder = 'YYMMDD',
  backPlaceholder = '0',
  frontMaxLength = 6,
  backMaxLength = 1,
  frontEditable = true,
  backEditable = true,
  frontDisplayValue,
  backDisplayValue,
  backMaskingText = '******',
}: IdentitySsnSectionProps) {
  const resolvedFrontDisplayValue =
    frontDisplayValue ?? frontValue ?? frontPlaceholder;
  const resolvedBackDisplayValue =
    backDisplayValue ?? backValue ?? backPlaceholder;

  return (
    <View style={containerStyle}>
      {frontEditable ? (
        <AuthUnderlineInput
          ref={frontInputRef}
          containerStyle={frontContainerStyle}
          inputStyle={frontValueStyle}
          value={frontValue}
          onChangeText={onFrontChange}
          placeholder={frontPlaceholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType="number-pad"
          maxLength={frontMaxLength}
        />
      ) : (
        <View style={frontContainerStyle}>
          <Text style={frontValueStyle}>{resolvedFrontDisplayValue}</Text>
        </View>
      )}

      <Text style={dashStyle}>-</Text>

      {backEditable ? (
        <AuthUnderlineInput
          ref={backInputRef}
          containerStyle={backContainerStyle}
          inputStyle={backValueStyle}
          value={backValue}
          onChangeText={onBackChange}
          placeholder={backPlaceholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType="number-pad"
          maxLength={backMaxLength}
          rightAccessory={<Text style={maskingTextStyle}>{backMaskingText}</Text>}
        />
      ) : (
        <View style={backContainerStyle}>
          <Text style={backValueStyle}>{resolvedBackDisplayValue}</Text>
          <Text style={maskingTextStyle}>{backMaskingText}</Text>
        </View>
      )}
    </View>
  );
}
