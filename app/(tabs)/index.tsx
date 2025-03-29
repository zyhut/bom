import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import SignOutButton from '../../components/SignOutButton';
import { useStore } from '../../store/useStore';
import { useGoals } from '../../store/GoalProvider';
import { canDeleteGoal, canCreateNewGoal, shouldAutoFailGoal } from '../../services/goalUtils';
import { getGoalActionMeta } from '../../utils/goalActionUtils';
import { format, differenceInCalendarDays } from 'date-fns';
import { Button, Card, Text, IconButton, ProgressBar, Snackbar, useTheme } from 'react-native-paper';
import CelebrationPopup from '../../components/CelebrationPopup';
import GoalFailedDialog from '../../components/GoalFailedDialog';
import { ThemedScreen } from '../../components/ThemedScreen';

export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const { goals, goalsLoading, deleteGoal, updateGoal } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [failedGoalId, setFailedGoalId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAppReady(true);
    });
    return () => unsubscribe();
  }, []);

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
    if (!goal || goal.checkIns.includes(today)) return;

    const updatedCheckIns = [...goal.checkIns, today];
    const updatedGoal = {
      checkIns: updatedCheckIns,
      status: updatedCheckIns.length >= goal.targetDays ? 'completed' : goal.status,
    };

    await updateGoal(goalId, updatedGoal);

    if (updatedGoal.status === 'completed') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal && canDeleteGoal(goal)) {
      await deleteGoal(goalId);
    }
  };

  useEffect(() => {
    const checkGoalPopup = async () => {
      const lastShownDate = await AsyncStorage.getItem('goalFailedPopupShownDate');
      if (lastShownDate !== today) {
        const failedUnpaidGoal = goals.find(
          (g) => g.status === 'failed' && g.paymentStatus === 'pending'
        );
        if (failedUnpaidGoal) {
          setFailedGoalId(failedUnpaidGoal.id);
          setShowFailedDialog(true);
          await AsyncStorage.setItem('goalFailedPopupShownDate', today);
        }
      }
    };
    checkGoalPopup();
  }, [goals]);

  const handleCreateGoal = () => {
    if (canCreateNewGoal(goals)) {
      router.push('./create');
    } else {
      setShowSnackbar(true);
    }
  };

  if (!appReady || goalsLoading) {
    return (
      <ThemedScreen>
        <ProgressBar indeterminate color={colors.primary} />
        <Text variant="labelLarge" style={styles.loadingText}>
          Loading goals...
        </Text>
      </ThemedScreen>
    );
  }

  const failedGoal = goals.find((g) => g.id === failedGoalId);

  return (
    <ThemedScreen>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <>
            <Text variant="headlineSmall" style={[{ color: colors.tertiary }, styles.welcome]}>
              {`${user?.displayName ?? 'CMITer'}, `}
              <Text style={{color: colors.primary}}>C'Meet It!</Text>
            </Text>
            {goals.length === 0 && (
              <Text variant="bodyLarge" style={styles.noGoalsText}>
                No goals yet. Let's set one and c'meet it!
              </Text>
            )}
          </>
        }
        ListFooterComponent={
          <>
            <Button
              mode="outlined"
              icon="plus-thick"
              onPress={handleCreateGoal}
              style={styles.createButton}
            >
              New Goal
            </Button>
            <SignOutButton />
          </>
        }
        renderItem={({ item }) => {
          const { label, disabled, type } = getGoalActionMeta(item);
          const remainingCheckIns = item.targetDays - item.checkIns.length;
          const daysLeft = differenceInCalendarDays(new Date(item.endDate), new Date());

          const handleActionPress = () => {
            if (type === 'checkin') handleCheckInToday(item.id);
            if (type === 'settle') router.push({ pathname: '/goal/payment', params: { goalId: item.id } });
          };

          return (
            <Card
              style={[{ backgroundColor: colors.surfaceContainer }, styles.goalContainer]}
              onLongPress={() => router.push(`/goal/detail/${item.id}`)}
            >
              <Card.Content>
                <View style={styles.goalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text variant='titleMedium' style={styles.goalTitle}>{item.title}</Text>
                    <Text variant="bodySmall">
                      <Text style={{ color: colors.tertiary }}>${item.commitmentAmount}</Text>
                      <Text style={{ color: colors.onSurfaceVariant }}> | </Text>
                      Due: {item.endDate}
                      <Text style={{ color: colors.onSurfaceVariant }}> | </Text>
                      {remainingCheckIns} check-ins left
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    iconColor={colors.secondary}
                    onPress={() => router.push(`/goal/detail/${item.id}`)}
                  />
                </View>
                <Text>Status: 
                  <Text style={{ color: item.status === 'failed' ? colors.error : colors.onSurface }}> {item.status}</Text>
                </Text>
                <ProgressBar
                  progress={item.checkIns.length / item.targetDays}
                  color={
                    item.status === 'failed'/* || (item.status === 'active' && daysLeft < remainingCheckIns)*/
                      ? colors.error
                      : colors.primary
                  }
                  style={[{}, styles.progressBar]}
                />
                <Button
                  mode={'contained'}
                  disabled={disabled}
                  onPress={handleActionPress}
                  style={styles.checkInButton}
                >
                  {label}
                </Button>
              </Card.Content>
            </Card>
          );
        }}
      />

      <GoalFailedDialog
        visible={showFailedDialog}
        goalTitle={failedGoal?.title}
        commitmentAmount={failedGoal?.commitmentAmount}
        endDate={failedGoal?.endDate}
        onDismiss={() => setShowFailedDialog(false)}
        onSettleUp={() => {
          setShowFailedDialog(false);
          if (failedGoalId) {
            router.push({ pathname: '/goal/payment', params: { goalId: failedGoalId } });
          }
        }}
      />

      <CelebrationPopup visible={showCelebration} onDismiss={() => setShowCelebration(false)} />

      <Snackbar
        visible={showSnackbar}
        style={{ backgroundColor: colors.surfaceContainer }}
        theme={{ colors: { inverseOnSurface: colors.error } }}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{ label: 'OK', onPress: () => { } }}
      >
        You either have unpaid goals or too many ongoing goals.
      </Snackbar>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  welcome: { marginBottom: 20, textAlign: 'center' },
  noGoalsText: { marginVertical: 20, textAlign: 'center' },
  goalContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  goalTitle: {
    marginBottom: 2,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 16,
  },
  createButton: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  checkInButton: {
    marginTop: 5,
  },
});