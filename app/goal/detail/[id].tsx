// app/goal/detail/[id].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, ProgressBar, IconButton, Card, Text, useTheme } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isWithinInterval, subDays, differenceInCalendarDays } from 'date-fns';
import { useGoals } from '../../../store/GoalProvider';
import { Goal } from '../../../types/Goal';
import { canDeleteGoal, shouldAutoFailGoal } from '../../../services/goalUtils';
import { ThemedScreen } from '../../../components/ThemedScreen';
import { getGoalActionMeta } from '../../../utils/goalActionUtils';
import CelebrationPopup from '../../../components/CelebrationPopup';

const GoalDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal, deleteGoal } = useGoals();
  const router = useRouter();
  const { colors } = useTheme();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
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
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
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

    handleCheckIn(date);
  };

  const handleDeleteGoal = async () => {
    if (goal && canDeleteGoal(goal)) {
      await deleteGoal(goal.id);
      router.replace('/');
    }
  };

  const handleFailNow = async () => {
    if (goal) {
      await updateGoal(goal.id, {
        status: 'failed',
        paymentStatus: goal.commitmentType === 'committed' ? 'pending' : 'waived',
      });
      router.replace('/');
    }
  };

  const renderCalendar = () => {
    if (!goal) return null;

    const markedDates = goal.checkIns.reduce((acc, date) => {
      acc[date] = {
        marked: false,
        selected: true,
        selectedColor: colors.secondaryContainer,
      };
      return acc;
    }, {} as Record<string, any>);

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
        style={{ backgroundColor: colors.surfaceContainer, borderRadius: 8 }}
        theme={{
          backgroundColor: colors.surfaceContainer,
          calendarBackground: colors.surfaceContainer,
          selectedDayBackgroundColor: colors.secondaryContainer,
          selectedDayTextColor: colors.onSecondaryContainer,
          todayTextColor: colors.primary,
          dotColor: colors.secondary,
          arrowColor: colors.secondary,
          indicatorColor: colors.secondary,
          textSectionTitleColor: colors.onSurface,
          dayTextColor: colors.onSurface,
          monthTextColor: colors.onSurface,
          textDisabledColor: colors.surfaceDisabled,
          week: { backgroundColor: colors.primary },
        }}
      />
    );
  };

  if (!goal) return <Text variant="bodyLarge">Goal not found.</Text>;

  const remainingCheckIns = goal.targetDays - goal.checkIns.length;
  const remainingDays = differenceInCalendarDays(parseISO(goal.endDate), new Date());
  const { label: actionLabel, disabled: actionDisabled } = getGoalActionMeta(goal);
  const canBeFailedEarly = goal.status === 'active' && remainingDays < remainingCheckIns;

  return (
    <ThemedScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={[{ backgroundColor: colors.surfaceContainer }, styles.card]}>
          <View style={styles.header}>
            <Text variant="headlineMedium">{goal.title}</Text>
            {canDeleteGoal(goal) && (
              <IconButton icon="delete-outline" onPress={handleDeleteGoal} accessibilityLabel="Delete Goal" />
            )}
          </View>

          <Text variant="bodyMedium">Description: {goal.description || 'No description provided'}</Text>
          <Text variant="bodyMedium">Start: {goal.startDate}</Text>
          <Text variant="bodyMedium">End: {goal.endDate}</Text>
          <Text variant="bodyMedium">Target Days: {goal.targetDays}</Text>
          <Text variant="bodyMedium">Remaining Check-Ins: {remainingCheckIns}</Text>
          <Text variant="bodyMedium">Commitment: <Text style={{ color: colors.tertiary }}>${goal.commitmentAmount}</Text></Text>
          <Text variant="bodyMedium">Status: <Text variant="bodyMedium" style={{ color: goal.status === 'failed' ? colors.error : colors.onSurface }}>{goal.status}</Text></Text>

          <ProgressBar
            progress={goal.checkIns.length / goal.targetDays}
            style={[{ }, styles.progressBar]}
            color={
              goal.status === 'failed'/* || remainingDays < remainingCheckIns*/
                ? colors.error
                : colors.primary
            }
          />
          <Text variant="labelSmall" style={styles.progressText}>
            {goal.checkIns.length}/{goal.targetDays} Check-Ins
          </Text>

          <Button mode="contained"
            disabled={actionDisabled}
            onPress={handlePrimaryAction}
            style={styles.checkInButton}>
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
        </Card>

        <Card style={[{ backgroundColor: colors.surfaceContainer }, styles.card]}>
          <Text variant="titleMedium" style={styles.subheader}>Check-In Calendar</Text>
          <Text variant="bodySmall" style={{ color: colors.primary, marginBottom: 10 }}>
            📅 Tap a past date (within the last 3 days) to backfill a missed check-in.
          </Text>
          {renderCalendar()}
        </Card>
        <Button mode="text" textColor={ colors.secondary } onPress={() => router.replace('/')} style={{ marginBottom: 10 }}>
          Back to Home
        </Button>
      </ScrollView>

      <CelebrationPopup
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />
    </ThemedScreen>
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