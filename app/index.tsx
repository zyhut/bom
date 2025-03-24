// app/index.tsx

import React, { useState, useEffect } from 'react';
import { FlatList, Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignOutButton from '../components/SignOutButton';
import { useGoals } from '../store/GoalProvider';
import { Menu, Divider, ProgressBar, IconButton, useTheme, Button } from 'react-native-paper';
import { format } from 'date-fns';
import { canDeleteGoal, canCreateNewGoal, shouldAutoFailGoal } from '../services/goalUtils';
import { ThemedText } from '../components/ThemedText';
import { ThemedCard } from '@/components/ThemedCard';

export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const { goals, goalsLoading, deleteGoal, updateGoal } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();
  const today = format(new Date(), 'yyyy-MM-dd');
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
    goals.forEach((goal) => {
      if (shouldAutoFailGoal(goal) && goal.status !== 'failed') {
        updateGoal(goal.id, {
          status: 'failed',
          paymentStatus: goal.commitmentType === 'committed' ? 'pending' : 'waived',
        });
      }
    });
  }, [goals]);

  const handleCheckInToday = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    if (goal.checkIns.includes(today)) {
      Alert.alert('Already Checked In', 'You have already checked in today.');
      return;
    }

    await updateGoal(goalId, { checkIns: [...goal.checkIns, today] });
    Alert.alert('Success', 'Check-in completed for today!');
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);

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
      <>
        <ProgressBar indeterminate color="#1E3A8A" />
        <ThemedText variant="labelLarge" style={styles.loadingText}>
          Loading goals...
        </ThemedText>
      </>
    );
  }

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 16 }}
      ListHeaderComponent={
        <>
          <ThemedText variant="headlineMedium" style={styles.welcome}>
            {`Welcome to C'Meet It, ${user?.displayName ?? 'CMITer'}!`}
          </ThemedText>
          {goals.length === 0 && (
            <ThemedText variant="bodyLarge" style={styles.noGoalsText}>
              No goals yet. Let's set one and c'meet it!
            </ThemedText>
          )}
        </>
      }
      ListFooterComponent={
        <>
          <Button
            mode="outlined"
            icon="plus-thick"
            onPress={handleCreateGoal} 
            style={styles.createButton}>
            New Goal
          </Button>
          <SignOutButton />
        </>
      }
      renderItem={({ item }) => {
        const hasCheckedInToday = item.checkIns.includes(today);
        const remainingDays = item.targetDays - item.checkIns.length;

        const isNotStarted = today < item.startDate;
        const isCompleted = item.status === 'completed';
        const isFailedPaid = item.status === 'failed' && item.paymentStatus === 'paid';
        const isFailedPending = item.status === 'failed' && item.paymentStatus === 'pending';

        let actionLabel = 'Check In Today';
        let actionDisabled = false;
        let actionType: 'checkin' | 'settle' | null = 'checkin';

        if (isNotStarted) {
          actionLabel = 'Not Started';
          actionDisabled = true;
          actionType = null;
        } else if (isCompleted) {
          actionLabel = 'Completed';
          actionDisabled = true;
          actionType = null;
        } else if (isFailedPaid) {
          actionLabel = 'Settled';
          actionDisabled = true;
          actionType = null;
        } else if (isFailedPending) {
          actionLabel = 'Settle Up';
          actionType = 'settle';
        } else if (hasCheckedInToday) {
          actionLabel = 'Checked In';
          actionDisabled = true;
          actionType = null;
        }

        const handleActionPress = () => {
          if (actionType === 'checkin') {
            handleCheckInToday(item.id);
          } else if (actionType === 'settle') {
            router.push({ pathname: '/goal/payment', params: { goalId: item.id } });
          }
        };

        return (
          <ThemedCard style={styles.goalContainer}  onLongPress={() => router.push(`/goal/detail/${item.id}`)}>
            <View style={styles.goalHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.goalTitle}>{item.title}</ThemedText>
                <ThemedText variant="bodySmall" style={{ color: colors.secondary }}>
                  ${item.commitmentAmount} | Due: {item.endDate} | {remainingDays} check-ins left
                </ThemedText>
              </View>
              <Menu
                visible={menuVisible === item.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    onPress={() => setMenuVisible(item.id)}
                    accessibilityLabel="More options"
                    iconColor={colors.primary}
                  />
                }
              >
                <Menu.Item onPress={() => router.push(`/goal/detail/${item.id}`)} title="View Details" />
                <Divider />
                <Menu.Item onPress={() => handleDeleteGoal(item.id)} title="Delete" />
              </Menu>
            </View>

            <ThemedText style={{ marginBottom: 4 }}>Status: {item.status}</ThemedText>

            <ProgressBar
              progress={item.checkIns.length / item.targetDays}
              color={item.status === 'failed' ? colors.error : colors.primary}
              style={[{ backgroundColor: colors.background }, styles.progressBar]}
            />

            <Button
              mode={'contained'}
              disabled={actionDisabled}
              onPress={handleActionPress}
              style={[
                styles.checkInButton,
              ]}
            >
              {actionLabel}
            </Button>
          </ThemedCard>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { marginBottom: 20, textAlign: 'center' },
  noGoalsText: { marginVertical: 20, textAlign: 'center' },
  goalContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  createButton: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkInButton: {
    marginTop: 5,
  },
});