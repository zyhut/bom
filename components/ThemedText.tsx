// components/ThemedText.tsx
import React from 'react';
import { useTheme, Text } from 'react-native-paper';
import { StyleProp, TextStyle, Text as RNText } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: "bodyMedium",
  color?: string;
};

export const ThemedText = ({ children, style, variant, color, ...props }: Props) => {
  const { colors } = useTheme();

  return (
    <Text
      variant={variant}
      style={[{ color: color }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};