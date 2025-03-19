import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignOutButton from '../components/SignOutButton';
import { Platform } from 'react-native';
import { useGoals } from '../store/GoalProvider';
import { Menu, Divider, Button, ProgressBar, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { canDeleteGoal, canCreateNewGoal, shouldAutoFailGoal } from '../services/goalUtils';

if (Platform.OS === 'web') {
  React.useLayoutEffect = React.useEffect;
}

export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const { goals, goalsLoading, deleteGoal, updateGoal } = useGoals();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState<string | null>(null);

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

  useEffect(() => {
    // Auto-fail goals that have exceeded grace period
    goals.forEach((goal) => {
      if (shouldAutoFailGoal(goal) && goal.status !== 'failed') {
        updateGoal(goal.id, { status: 'failed', paymentStatus: goal.commitmentType === 'committed' ? 'pending' : 'waived' });
      }
    });
  }, [goals]);

  const handleCheckInToday = async (goalId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const goal = goals.find(g => g.id === goalId);
    
    if (goal?.checkIns.includes(today)) {
      Alert.alert('Already Checked In', 'You have already checked in today.');
      return;
    }
    
    await updateGoal(goalId, { checkIns: [...goal.checkIns, today] });
    Alert.alert('Success', 'Check-in completed for today!');
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    
    if (goal && canDeleteGoal(goal)) {
      await deleteGoal(goalId);
      Alert.alert('Goal Deleted', 'The goal has been successfully deleted.');
    } else {
      Alert.alert('Cannot Delete', 'This goal cannot be deleted after 3 days.');
    }
  };

  const handleCreateGoal = () => {
    if (canCreateNewGoal(goals)) {
      router.push('/goal/create');
    } else {
      Alert.alert(
        'Cannot Create New Goal',
        'You either have unpaid goals or too many ongoing goals. Complete or resolve them first!'
      );
    }
  };

  if (!appReady || goalsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {`Welcome to C'Meet It (CMIT), ${user?.displayName ?? 'CMITer'}!`}
      </Text>

      {goals.length === 0 ? (
        <Text style={styles.noGoalsText}>No goals yet. Let's set one and c'meet it!</Text>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalContainer}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                
                <Menu
                  visible={menuVisible === item.id}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => setMenuVisible(item.id)}
                      accessibilityLabel="More options"
                      color="#333"
                      style={styles.menuButton}
                    />
                  }
                >
                  <Menu.Item onPress={() => router.push(`/goal/detail/${item.id}`)} title="View Details" />
                  <Menu.Item onPress={() => handleCheckInToday(item.id)} title="Check In Today" />
                  <Divider />
                  <Menu.Item onPress={() => handleDeleteGoal(item.id)} title="Delete" />
                </Menu>
              </View>

              <Text>Status: {item.status}</Text>
              <ProgressBar progress={item.checkIns.length / item.targetDays} color="#4CAF50" style={styles.progressBar} />
              {item.status === 'failed' && item.paymentStatus === 'pending' && (
                <Button
                  mode="contained"
                  onPress={() => router.push({ pathname: '/goal/payment', params: { goalId: item.id } })}
                  style={styles.payButton}
                >
                  Settle Up
                </Button>
              )}
            </View>
          )}
        />
      )}

      <Button mode="contained" onPress={handleCreateGoal} style={styles.createButton}>
        Create New Goal
      </Button>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#87CEEB',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
    textAlign: 'center',
  },
  noGoalsText: {
    fontSize: 18,
    color: '#555',
    marginVertical: 20,
    textAlign: 'center',
  },
  goalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    alignSelf: 'flex-end',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  payButton: {
    marginTop: 10,
    backgroundColor: '#FF4500',
  },
  createButton: {
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#FF4500',
    textAlign: 'center',
    marginTop: 10,
  },
});