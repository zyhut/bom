// app/_layout.tsx

import React from 'react';
import { Slot } from 'expo-router';
import { GoalProvider } from '../store/GoalProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLIC_KEY } from "../services/keys";

export default function Layout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
      <PaperProvider>
        <GoalProvider>
          <SafeAreaView style={styles.container}>
            <Slot />
          </SafeAreaView>
        </GoalProvider>
      </PaperProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // Light blue theme background
  },
});
