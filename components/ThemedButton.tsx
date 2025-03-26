import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';


type Props = {
  children: React.ReactNode;
  onPress: () => void;
  textColor?: string;
  theme?: any;
  style?: any;
};

export const ThemedButton = ({ children, onPress, textColor, theme, style }: Props) => {
  const { colors } = useTheme();

  return (
    <Button
      mode="outlined"
      textColor={textColor || colors.primary}
      style={[{ borderRadius: 8 }, style]}
      theme={theme}
      onPress={onPress}
    >
      {children}
    </Button>
  );
};