// app/index.tsx

import React, { useState, useEffect } from 'react';
import { FlatList, Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignOutButton from '../components/SignOutButton';
import { useGoals } from '../store/GoalProvider';
import { Menu, Divider, ProgressBar, IconButton, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { canDeleteGoal, canCreateNewGoal, shouldAutoFailGoal } from '../services/goalUtils';
import { ThemedScreen } from '../components/ThemedScreen';
import { ThemedText } from '../components/ThemedText';
import { ThemedButton } from '../components/ThemedButton';

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
          <ThemedText variant="headlineSmall" style={styles.welcome}>
            {`Welcome to C'Meet It (CMIT), ${user?.displayName ?? 'CMITer'}!`}
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
          <ThemedButton mode="contained" onPress={handleCreateGoal} style={styles.createButton}>
            Create New Goal
          </ThemedButton>
          <SignOutButton />
        </>
      }
      renderItem={({ item }) => {
        const hasCheckedInToday = item.checkIns.includes(today);
        const remainingDays = Math.max(
          0,
          Math.ceil((new Date(item.endDate).getTime() - Date.now()) / 86400000)
        );

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
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.goalTitle}>{item.title}</ThemedText>
                <ThemedText variant="bodySmall" style={{ color: colors.outline }}>
                  Ends: {item.endDate} | {remainingDays} days left
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
                    color="#333"
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
              style={styles.progressBar}
            />

            <ThemedButton
              mode={actionDisabled ? 'outlined' : 'contained'}
              disabled={actionDisabled}
              onPress={handleActionPress}
              style={[
                styles.checkInButton,
                actionDisabled && {
                  backgroundColor: colors.surfaceDisabled,
                  borderColor: colors.outline,
                },
              ]}
              labelStyle={{
                color: actionDisabled ? colors.onSurfaceDisabled : colors.primary,
              }}
            >
              {actionLabel}
            </ThemedButton>
          </View>
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
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  createButton: {
    marginVertical: 10,
    borderRadius: 8,
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkInButton: {
    marginTop: 10,
    borderColor: '#1E3A8A',
  },
});