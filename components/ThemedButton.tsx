import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';


type Props = {
  children: React.ReactNode;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  textColor?: string;
  theme?: any;
  style?: any;
};

export const ThemedButton = ({ children, onPress, mode, textColor, theme, style }: Props) => {
  const { colors } = useTheme();

  return (
    <Button
      mode={mode || 'outlined'}
      textColor={ textColor }
      style={[{ borderRadius: 8 }, style]}
      theme={theme}
      onPress={onPress}
    >
      {children}
    </Button>
  );
};