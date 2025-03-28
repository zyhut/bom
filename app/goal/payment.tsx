import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { getClientSecret, processPayment } from '../../services/paymentService';
import { useStripe } from '@stripe/stripe-react-native';
import { ThemedScreen } from '../../components/ThemedScreen';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

export default function PaymentsScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { goals, updateGoal, goalsLoading } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();

  const goal = goals.find(g => g.id === goalId);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);

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
      console.error('❌ Stripe methods not available!');
      Alert.alert('Payment Error', 'Stripe is not initialized. Please try again.');
      return;
    }

    if (!clientSecret) {
      Alert.alert('Payment Error', 'No client secret available. Please try again.');
      return;
    }

    setPaymentLoading(true);
    setPaymentErrorMessage(null);

    try {
      const success = await processPayment(clientSecret, initPaymentSheet, presentPaymentSheet);
      if (success) {
        await updateGoal(goal.id, { paymentStatus: 'paid' });
        setPaymentSuccess(true);
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else {
        setPaymentErrorMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setPaymentErrorMessage('An error occurred during payment.');
    }

    setPaymentLoading(false);
  };

  if (goalsLoading) {
    return (
      <ThemedScreen>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading goal...</Text>
      </ThemedScreen>
    );
  }

  if (!goal) {
    return (
      <ThemedScreen>
        <Text style={styles.errorText}>Goal not found or already paid.</Text>
        <Button onPress={() => router.replace('/')}>Back to Home</Button>
      </ThemedScreen>
    );
  }

  return (
    <ThemedScreen>
      <Card style={{ backgroundColor: colors.surfaceContainer }}>
        <Card.Content>
          {paymentSuccess ? (
            <LottieView
              source={require('../../assets/animations/payment-success.json')}
              autoPlay
              loop={false}
              style={{ height: 120 }}
            />
          ) : (
            <>
              <Text variant="titleMedium" style={styles.title}>Settle Commitment</Text>
              <Text style={styles.subtitle}>{goal.title}</Text>
              <Text style={styles.amount}>Amount Due: ${goal.commitmentAmount}</Text>

              {paymentErrorMessage && (
                <Text style={styles.errorText}>{paymentErrorMessage}</Text>
              )}

              {clientSecret === null ? (
                <ActivityIndicator size="large" color="#1E3A8A" />
              ) : paymentLoading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <>
                  <Button
                    mode="contained"
                    theme={{ colors: { outline: colors.secondary } }}
                    onPress={handlePayment}
                  >
                    Settle Up
                  </Button>
                  <Button
                    onPress={() => router.replace('/')}
                    textColor={colors.secondary}
                    style={styles.backButton}
                  >
                    Back to Home
                  </Button>
                </>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { textAlign: 'center', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 10 },
  amount: { textAlign: 'center', marginBottom: 10 },
  errorText: { color: '#FF3B30', textAlign: 'center', marginVertical: 10 },
  loadingText: { fontSize: 18, color: '#555', textAlign: 'center', marginTop: 10 },
  backButton: { marginTop: 10 }
});