import React, { forwardRef, type ReactNode } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface AuthUnderlineInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  rightAccessory?: ReactNode;
}

const AuthUnderlineInput = forwardRef<TextInput, AuthUnderlineInputProps>(
  ({ containerStyle, inputStyle, rightAccessory, ...inputProps }, ref) => (
    <View style={containerStyle}>
      <TextInput
        ref={ref}
        style={inputStyle}
        {...inputProps}
      />
      {rightAccessory}
    </View>
  ),
);

AuthUnderlineInput.displayName = 'AuthUnderlineInput';

export default AuthUnderlineInput;
