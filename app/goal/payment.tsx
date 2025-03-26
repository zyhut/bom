import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { getClientSecret, processPayment } from '../../services/paymentService';
import { useStripe } from "@stripe/stripe-react-native";
import { ThemedText } from '../../components/ThemedText';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedCard } from '../../components/ThemedCard';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function PaymentsScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { goals, updateGoal, goalsLoading } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();
  
  const goal = goals.find(g => g.id === goalId);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecret = async () => {
      if (goal) {
        const secret = await getClientSecret(goal.id);
        setClientSecret(secret);
      }
    };
    fetchSecret();
  }, [goal]);

  const handlePayment = async () => {
    if (!initPaymentSheet || !presentPaymentSheet) {
      console.error("❌ Stripe methods not available!");
      Alert.alert("Payment Error", "Stripe is not initialized. Please try again.");
      return;
    }

    if (!clientSecret) {
      Alert.alert('Payment Error', 'No client secret available. Please try again.');
      return;
    }

    setPaymentLoading(true);
    try {
      const success = await processPayment(clientSecret, initPaymentSheet, presentPaymentSheet);
      if (success) {
        await updateGoal(goal.id, { paymentStatus: 'paid' });
        Alert.alert('Payment Successful', `Your commitment of $${goal.commitmentAmount} is settled.`);
        router.replace('/');
      } else {
        Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'An error occurred during payment.');
    }
    setPaymentLoading(false);
  };

  if (goalsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <ThemedText style={styles.loadingText}>Loading goal...</ThemedText>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorText}>Goal not found or already paid.</ThemedText>
        <ThemedButton onPress={() => router.replace('/')}>Back to Home</ThemedButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedCard style={styles.card}>
        <ThemedText variant="titleMedium" style={styles.title}>Settle Commitment</ThemedText>
        <ThemedText style={styles.subtitle}>{goal.title}</ThemedText>
        <ThemedText style={styles.amount}>Amount Due: ${goal.commitmentAmount}</ThemedText>

        {clientSecret === null ? (
          <ActivityIndicator size="large" color="#1E3A8A" />
        ) : (
          <>
            {paymentLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                  <ThemedButton
                    textColor={colors.secondary}
                    theme={{ colors: { outline: colors.secondary } }}
                    onPress={handlePayment}
                  >Settle Up</ThemedButton>
            )}
            <ThemedButton onPress={() => router.replace('/')} style={styles.backButton}>
              Back to Home
            </ThemedButton>
          </>
        )}
      </ThemedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 10 },
  amount: { textAlign: 'center', marginBottom: 20 },
  errorText: { fontSize: 18, color: '#FF4500', textAlign: 'center', marginTop: 20 },
  loadingText: { fontSize: 18, color: '#555', textAlign: 'center', marginTop: 10 },
  backButton: { marginTop: 10 }
});