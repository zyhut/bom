// components/ThemedInput.tsx
import React from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { StyleProp, ViewStyle } from 'react-native';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: StyleProp<ViewStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export const ThemedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  autoCapitalize = 'none',
}: Props) => {
  const { colors } = useTheme();

  return (
    <TextInput
      mode="outlined"
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      outlineColor={colors.primary}
      activeOutlineColor={colors.primary}
      style={style}
    />
  );
};