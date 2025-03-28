import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type Props = {
  children: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
};

export const ThemedScreen = ({ children, padded = true, style }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, padded && styles.padded, {backgroundColor: colors.surface}, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  padded: {
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 0,
    paddingLeft: 20,
  },
});