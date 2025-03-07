import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { getClientSecret, processPayment } from '../../services/paymentService';
import { useStripe } from "@stripe/stripe-react-native";

export default function PaymentsScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { goals, updateGoal, goalsLoading } = useGoals();
  const router = useRouter();
  
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

  if (goalsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading goal...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Goal not found or already paid.</Text>
        <Button title="Back to Home" onPress={() => router.replace('/')} />
      </View>
    );
  }

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
        Alert.alert('Payment Successful', `Your payment of $${goal.commitmentAmount} was processed.`);
        router.replace('/');
      } else {
        Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'An error occurred during payment.');
    }
    setPaymentLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Penalty</Text>
      <Text style={styles.goalTitle}>{goal.title}</Text>
      <Text>Amount Due: ${goal.commitmentAmount}</Text>

      {clientSecret === null ? (
        <ActivityIndicator size="large" color="#1E3A8A" />
      ) : (
        <>
          {paymentLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <Button title="Pay Now" onPress={handlePayment} color="#4CAF50" />
          )}
          <Button title="Back to Home" onPress={() => router.replace('/')} color="#1E90FF" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E3A8A', textAlign: 'center' },
  goalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  errorText: { fontSize: 18, color: '#FF4500', textAlign: 'center', marginTop: 20 },
  loadingText: { fontSize: 18, color: '#555', textAlign: 'center', marginTop: 10 },
});
