// components/ThemedText.tsx
import React from 'react';
import { useTheme } from 'react-native-paper';
import { StyleProp, TextStyle, Text } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: keyof typeof Text['displayName'];
  color?: string;
};

export const ThemedText = ({ children, style, color, ...props }: Props) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[{ color: color || colors.primary }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};