import React from 'react';
import { Slot } from 'expo-router';
import { GoalProvider } from '../store/GoalProvider';
import { Provider as PaperProvider } from 'react-native-paper';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLIC_KEY } from '../services/keys';
import { useColorScheme, SafeAreaView } from 'react-native';
import { lightTheme, darkTheme } from '../theme/theme';

export default function Layout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
        <PaperProvider theme={theme}>
          <GoalProvider>
            <Slot />
          </GoalProvider>
        </PaperProvider>
      </StripeProvider>
    </SafeAreaView>
  );
}