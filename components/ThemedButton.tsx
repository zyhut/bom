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
      mode="contained"
      textColor={colors.onPrimary}
      style={[{ backgroundColor: colors.primary, borderRadius: 8 }, style]}
      onPress={onPress}
    >
      <ThemedText
        style={{ color: colors.onPrimary, fontWeight: "bold"}}
      >
          {children}
      </ThemedText>
    </Button>
  );
};