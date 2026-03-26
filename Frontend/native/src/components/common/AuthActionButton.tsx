import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface AuthActionButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  activeContainerStyle?: StyleProp<ViewStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  disabledTextStyle?: StyleProp<TextStyle>;
  loadingColor?: string;
  activeOpacity?: number;
}

export default function AuthActionButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  active = false,
  containerStyle,
  activeContainerStyle,
  disabledContainerStyle,
  textStyle,
  activeTextStyle,
  disabledTextStyle,
  loadingColor,
  activeOpacity = 0.85,
}: AuthActionButtonProps) {
  const isDisabled = disabled || loading || !onPress;

  return (
    <TouchableOpacity
      style={[
        containerStyle,
        active && activeContainerStyle,
        isDisabled && disabledContainerStyle,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} />
      ) : (
        <Text
          style={[
            textStyle,
            active && activeTextStyle,
            isDisabled && disabledTextStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
