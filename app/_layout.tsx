// app/_layout.tsx

import React from 'react';
import { Slot } from 'expo-router';
import { GoalProvider } from '../store/GoalProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <PaperProvider>
      <GoalProvider>
        <SafeAreaView style={styles.container}>
          <Slot />
        </SafeAreaView>
      </GoalProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // Light blue theme background
  },
});
