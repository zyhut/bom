// components/ThemedCard.tsx
import React from 'react';
import { Card, useTheme } from 'react-native-paper';

type Props = React.ComponentProps<typeof Card>;

export const ThemedCard = ({ children, style, ...props }: Props) => {
  const { colors } = useTheme();

  return (
    <Card
      style={[{ borderRadius: 12 }, style]}
      {...props}
    >
      {children}
    </Card>
  );
};