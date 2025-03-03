import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useGoals } from '../../store/GoalProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Goal } from '../../types/Goal';
import { processPayment } from '../../services/paymentService';

export default function PaymentsScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { goals, updateGoal } = useGoals();
  const router = useRouter();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundGoal = goals.find(g => g.id === goalId);
    setGoal(foundGoal || null);
    setLoading(false);
  }, [goalId, goals]);

  const handlePayment = async () => {
    if (!goal) return;

    setLoading(true);

    try {
      const success = await processPayment(goal.stakeAmount);

      if (success) {
        await updateGoal(goal.id, { paymentStatus: 'paid' });
        Alert.alert('Payment Successful', `Your payment of $${goal.stakeAmount} was processed.`);
        router.replace('/');
      } else {
        Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'An error occurred during payment.');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text>Loading payment details...</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Penalty</Text>
      <Text style={styles.goalTitle}>{goal.title}</Text>
      <Text>Amount Due: ${goal.stakeAmount}</Text>
      <Button title="Pay Now" onPress={handlePayment} color="#4CAF50" />
      <Button title="Back to Home" onPress={() => router.replace('/')} color="#1E90FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E3A8A', textAlign: 'center' },
  goalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  errorText: { fontSize: 18, color: '#FF4500', textAlign: 'center', marginTop: 20 },
});
