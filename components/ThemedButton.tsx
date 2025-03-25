import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ThemedText } from './ThemedText';


type Props = {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
};

export const ThemedButton = ({ children, onPress, style }: Props) => {
  const { colors } = useTheme();

  return (
    <Button
      mode="outlined"
      textColor={colors.primary}
      style={[{ borderRadius: 8 }, style]}
      onPress={onPress}
    >
      {children}
    </Button>
  );
};