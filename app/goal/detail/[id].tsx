// app/goal/detail/[id].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ProgressBar, IconButton, useTheme } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isWithinInterval, subDays, differenceInCalendarDays } from 'date-fns';
import { useGoals } from '../../../store/GoalProvider';
import { Goal } from '../../../types/Goal';
import { canDeleteGoal, shouldAutoFailGoal } from '../../../services/goalUtils';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedCard } from '../../../components/ThemedCard';
import { getGoalActionMeta } from '../../../utils/goalActionUtils';

const GoalDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal, deleteGoal } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();
  const [goal, setGoal] = useState<Goal | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (id) {
      const foundGoal = goals.find((g) => g.id === id);
      setGoal(foundGoal || null);

      if (foundGoal && shouldAutoFailGoal(foundGoal) && foundGoal.status !== 'failed') {
        updateGoal(foundGoal.id, {
          status: 'failed',
          paymentStatus: foundGoal.commitmentType === 'committed' ? 'pending' : 'waived',
        });
        Alert.alert('Goal Auto-Failed', 'You can handle the payment now.');
        router.replace('/');
      }
    }
  }, [id, goals]);

  const handleCheckIn = async (date: string) => {
    if (!goal || goal.checkIns.includes(date)) return;

    const updatedCheckIns = [...goal.checkIns, date];
    const updatedGoal: Partial<Goal> = {
      checkIns: updatedCheckIns,
      status: updatedCheckIns.length >= goal.targetDays ? 'completed' : goal.status,
    };

    if (updatedGoal.status === 'completed') {
      Alert.alert('Goal Completed!', 'Congratulations on completing your goal!');
    }

    await updateGoal(goal.id, updatedGoal);
  };

  const handlePrimaryAction = () => {
    if (!goal) return;
    const { type } = getGoalActionMeta(goal);
    if (type === 'checkin') handleCheckIn(today);
    if (type === 'settle') router.push({ pathname: '/goal/payment', params: { goalId: goal.id } });
  };

  const handleBackfill = (date: string) => {
    if (!goal || goal.status !== 'active') return;
    if (date < goal.startDate || date > goal.endDate || goal.checkIns.includes(date)) return;

    Alert.alert('Confirm Backfill', `Do you want to backfill for ${date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => handleCheckIn(date) },
    ]);
  };

  const handleDeleteGoal = async () => {
    if (goal && canDeleteGoal(goal)) {
      await deleteGoal(goal.id);
      router.replace('/');
    } else {
      Alert.alert('Cannot Delete', 'This goal cannot be deleted after 3 days.');
    }
  };

  const handleFailNow = async () => {
    if (goal) {
      await updateGoal(goal.id, {
        status: 'failed',
        paymentStatus: goal.commitmentType === 'committed' ? 'pending' : 'waived',
      });
      Alert.alert('Goal Failed', 'You marked this goal as failed.');
      router.replace('/');
    }
  };

  const renderCalendar = () => {
    if (!goal) return null;

    const markedDates = goal.checkIns.reduce((acc, date) => {
      acc[date] = {
        marked: true,
        selected: true,
        selectedColor: colors.primary,
        dotColor: colors.primary,
        textColor: 'white',
      };
      return acc;
    }, {} as Record<string, any>);

    // Highlight today
    markedDates[today] = {
      ...markedDates[today],
      dotColor: colors.tertiary,
      marked: true,
    };

    const backfillStart = format(subDays(parseISO(today), 3), 'yyyy-MM-dd');
    const backfillEnd = format(subDays(parseISO(today), 1), 'yyyy-MM-dd');
    const validBackfillRange = {
      start: goal.startDate > backfillStart ? goal.startDate : backfillStart,
      end: goal.endDate < backfillEnd ? goal.endDate : backfillEnd,
    };

    return (
      <Calendar
        markedDates={markedDates}
        onDayPress={({ dateString }) => {
          if (
            goal.status === 'active' &&
            isWithinInterval(parseISO(dateString), {
              start: parseISO(validBackfillRange.start),
              end: parseISO(validBackfillRange.end),
            })
          ) {
            handleBackfill(dateString);
          }
        }}
        style={{ backgroundColor: colors.surface, borderRadius: 8 }}
        theme={{
          backgroundColor: colors.surface,
          calendarBackground: colors.surface,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.onPrimary,
          todayTextColor: colors.secondary,
          dotColor: colors.secondary,
          arrowColor: colors.primary,
          indicatorColor: colors.secondary,
          textSectionTitleColor: colors.primary,
          dayTextColor: colors.primary,
          monthTextColor: colors.primary,
          textDisabledColor: colors.surfaceDisabled,
        }}
      />
    );
  };

  if (!goal) return <ThemedText variant="bodyLarge">Goal not found.</ThemedText>;

  const remainingCheckIns = goal.targetDays - goal.checkIns.length;
  const remainingDays = differenceInCalendarDays(parseISO(goal.endDate), new Date());

  const { label: actionLabel, disabled: actionDisabled } = getGoalActionMeta(goal);
  const canBeFailedEarly = goal.status === 'active' && remainingDays < remainingCheckIns;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedCard style={styles.card}>
        <View style={styles.header}>
          <ThemedText variant="headlineMedium">{goal.title}</ThemedText>
          {canDeleteGoal(goal) && (
            <IconButton icon="delete-outline" onPress={handleDeleteGoal} accessibilityLabel="Delete Goal" />
          )}
        </View>

        <ThemedText variant="bodySmall">Description: </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{goal.description || 'No description provided'}</ThemedText>
        <ThemedText variant="bodySmall">Start:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{goal.startDate}</ThemedText>
        <ThemedText variant="bodySmall">End:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{goal.endDate}</ThemedText>
        <ThemedText variant="bodySmall">Target Days:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{goal.targetDays}</ThemedText>
        <ThemedText variant="bodySmall">Remaining Check-Ins:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{remainingCheckIns}</ThemedText>
        <ThemedText variant="bodySmall">Commitment:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>${goal.commitmentAmount}</ThemedText>
        <ThemedText variant="bodySmall">Status:  </ThemedText><ThemedText variant="bodySmall" style={{ color: colors.secondary }}>{goal.status}</ThemedText>

        <ProgressBar
          progress={goal.checkIns.length / goal.targetDays}
          style={[{ backgroundColor: colors.background }, styles.progressBar]}
          color={
            goal.status === 'failed' || remainingDays < remainingCheckIns
              ? colors.error
              : colors.primary
          }
        />
        <ThemedText variant="labelSmall" color={colors.secondary} style={styles.progressText}>
          {goal.checkIns.length}/{goal.targetDays} Check-Ins
        </ThemedText>

        <Button mode="contained" disabled={actionDisabled} onPress={handlePrimaryAction} style={styles.checkInButton}>
          {actionLabel}
        </Button>

        {canBeFailedEarly && (
          <Button
            mode="text"
            textColor={colors.error}
            style={{ marginTop: 10, borderColor: colors.error }}
            onPress={handleFailNow}
          >
            Mark as Failed
          </Button>
        )}
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <ThemedText variant="titleMedium" style={styles.subheader}>Check-In Calendar</ThemedText>
        <ThemedText variant="bodySmall" style={{ color: colors.onSecondaryContainer, marginBottom: 10 }}>
          📅 Tap a past date (within the last 3 days) to backfill a missed check-in.
        </ThemedText>
        {renderCalendar()}
      </ThemedCard>
      <Button mode="text" onPress={() => router.replace('/')} style={{ marginBottom: 10 }}>
        Back to Home
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { marginBottom: 20, padding: 15, borderRadius: 8, elevation: 3 },
  progressBar: { height: 10, borderRadius: 5, marginVertical: 10 },
  progressText: { textAlign: 'center', marginTop: 0, marginBottom: 10 },
  checkInButton: { marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  subheader: { marginBottom: 10 },
});

export default GoalDetailScreen;