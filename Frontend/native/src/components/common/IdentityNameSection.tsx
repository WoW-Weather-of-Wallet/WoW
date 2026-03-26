import React from 'react';
import {
  Text,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import AuthUnderlineInput from './AuthUnderlineInput';

export interface IdentityNameSectionProps {
  value: string;
  containerStyle: StyleProp<ViewStyle>;
  valueStyle: StyleProp<TextStyle>;
  helperText?: string;
  helperTextStyle?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  editable?: boolean;
  displayValue?: string;
  placeholder?: string;
  inputProps?: TextInputProps;
  onChangeText?: (value: string) => void;
}

export default function IdentityNameSection({
  value,
  containerStyle,
  valueStyle,
  helperText,
  helperTextStyle,
  placeholderTextColor,
  editable = true,
  displayValue,
  placeholder = '이름',
  inputProps,
  onChangeText,
}: IdentityNameSectionProps) {
  const resolvedDisplayValue =
    displayValue !== undefined ? displayValue : value || '-';

  return (
    <>
      {editable ? (
        <AuthUnderlineInput
          containerStyle={containerStyle}
          inputStyle={valueStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          {...inputProps}
        />
      ) : (
        <View style={containerStyle}>
          <Text style={valueStyle}>{resolvedDisplayValue}</Text>
        </View>
      )}

      {helperText ? <Text style={helperTextStyle}>{helperText}</Text> : null}
    </>
  );
}
