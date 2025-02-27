// components/SignOutButton.tsx

import React from 'react';
import CustomButton from './CustomButton';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

const SignOutButton: React.FC = () => {
  const router = useRouter();
  const logout = useStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <CustomButton 
      title="Sign Out" 
      onPress={handleLogout} 
      backgroundColor="#FF6347" 
    />
  );
};

export default SignOutButton;
