import React from 'react';
import { Slot } from 'expo-router';
import { GoalProvider } from '../store/GoalProvider';

export default function Layout() {
  return (
    <GoalProvider>
      <Slot />
    </GoalProvider>
  );
}
