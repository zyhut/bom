// components/SignOutButton.tsx

import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { ThemedButton } from './ThemedButton';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

const SignOutButton: React.FC = () => {
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const { colors } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <Button
      mode="text"
      onPress={handleLogout}
      textColor={colors.secondary}
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton;
