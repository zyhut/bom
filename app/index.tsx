// app/index.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, FlatList, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignOutButton from '../components/SignOutButton';
import { Platform } from 'react-native';
import { useGoals } from '../store/GoalProvider';

// Fallback for useLayoutEffect during SSR
if (Platform.OS === 'web') {
  React.useLayoutEffect = React.useEffect;
}

// ✅ Home Content with Goals Logic
export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const { goals, goalsLoading, deleteGoal } = useGoals(); // Get goals from GoalProvide
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAppReady(true);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (appReady && !user) {
      router.replace('/auth/login');
    }
  }, [appReady, user]);

  if (!appReady || goalsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  const handleCreateGoal = () => {
    const hasUnpaidGoals = goals.some(goal => goal.paymentStatus === 'pending');
    if (hasUnpaidGoals) {
      Alert.alert('Unpaid Goals', 'You need to settle unpaid goals before creating new ones.');
    } else {
      router.push('/goal/create');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {`Welcome to BetOnMyself (BOM), ${user?.displayName ?? 'BOMer'}!`}
      </Text>

      <Button title="Create New Goal" onPress={handleCreateGoal} color="#4CAF50" />

      {goals.length === 0 ? (
        <Text style={styles.noGoalsText}>No goals yet. Let's set one and start betting on yourself!</Text>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalContainer}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text>Status: {item.status}</Text>
              <Button
                title="View Details"
                onPress={() => router.push(`/goal/detail/${item.id}`)}
                color="#1E90FF"
              />
              <Button
                title="Delete"
                onPress={() => deleteGoal(item.id)}
                color="#FF6347"
              />
            </View>
          )}
        />
      )}

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#87CEEB',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
  },
  noGoalsText: {
    fontSize: 18,
    color: '#555',
    marginVertical: 20,
  },
  goalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
