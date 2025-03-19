// app/goal/detail/[id].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGoals } from '../../../store/GoalProvider';
import { Goal } from '../../../types/Goal';
import { ProgressBar } from 'react-native-paper';
import { format, subDays, isWithinInterval, parseISO, addDays, isAfter } from 'date-fns';
import { canDeleteGoal, shouldAutoFailGoal } from '../../../services/goalUtils';

const GoalDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, updateGoal, deleteGoal } = useGoals();
  const router = useRouter();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) {
      const foundGoal = goals.find((g) => g.id === id);
      setGoal(foundGoal || null);

      if (foundGoal) {
        const progressPercentage = Math.min(
          (foundGoal.checkIns.length / foundGoal.targetDays) * 100,
          100
        );
        setProgress(progressPercentage);

        if (shouldAutoFailGoal(foundGoal) && foundGoal.status !== 'failed') {
          handleAutoFailGoal(foundGoal);
        }
      }
    }
  }, [id, goals]);

  const handleAutoFailGoal = async (goal: Goal) => {
    await updateGoal(goal.id, { status: 'failed', paymentStatus: goal.commitmentType === 'committed' ? 'pending' : 'waived' });
    Alert.alert('Goal Auto-Failed', 'You can handle the payment now.');
    router.replace('/');
  };

  const handleDeleteGoal = async () => {
    if (goal && canDeleteGoal(goal)) {
      await deleteGoal(goal.id);
      router.replace('/');
    } else {
      Alert.alert('Cannot Delete', 'This goal cannot be deleted after 3 days.');
    }
  };

  const handleCheckIn = async (date: string) => {
    if (!goal) return;

    if (goal.checkIns.includes(date)) {
      Alert.alert('Already Checked In', `You have already checked in for ${date}.`);
      return;
    }

    const updatedGoal: Partial<Goal> = {
      checkIns: [...goal.checkIns, date],
    };

    if (updatedGoal.checkIns!.length >= goal.targetDays) {
      updatedGoal.status = 'completed';
      Alert.alert('Goal Completed!', 'Congratulations on completing your goal!');
    }

    await updateGoal(goal.id, updatedGoal);
  };

  const getBackfillDates = () => {
    if (!goal) return [];

    const today = new Date();
    const startDate = parseISO(goal.startDate);
    const endDate = parseISO(goal.endDate);
    const validInterval = { start: startDate, end: addDays(endDate, 3) };

    return [1, 2, 3]
      .map((daysAgo) => subDays(today, daysAgo))
      .filter((date) => 
        isWithinInterval(date, validInterval) &&
        !goal.checkIns.includes(format(date, 'yyyy-MM-dd'))
      )
      .map((date) => format(date, 'yyyy-MM-dd'));
  };

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text>Goal not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{goal.title}</Text>
      <Text>Description: {goal.description || 'No description provided'}</Text>
      <Text>Start Date: {goal.startDate}</Text>
      <Text>End Date: {goal.endDate}</Text>
      <Text>Commitment Amount: ${goal.commitmentAmount}</Text>
      <Text>Status: {goal.status}</Text>
      
      <Text>Progress: {progress.toFixed(1)}%</Text>
      <ProgressBar progress={goal.checkIns.length / goal.targetDays} color="#4CAF50" />

      {/* Check-In Buttons */}
      <Button title="Check In for Today" onPress={() => handleCheckIn(format(new Date(), 'yyyy-MM-dd'))} color="#4CAF50" />

      <Text style={styles.subheader}>Backfill Check-In:</Text>
      {getBackfillDates().map((date) => (
        <Button 
          key={date} 
          title={`Backfill for ${date}`} 
          onPress={() => handleCheckIn(date)} 
          color="#FFA500" 
        />
      ))}

      {/* Show All Past Check-Ins */}
      <Text style={styles.subheader}>Check-In History:</Text>
      <FlatList
        data={goal.checkIns.sort().reverse()} // Show most recent first
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Text style={styles.checkInItem}>✅ {item}</Text>
        )}
      />

      {goal.status === 'failed' && goal.paymentStatus === 'pending' && (
        <Button 
          title="Settle Up"
          onPress={() => router.push({ pathname: '/goal/payment', params: { goalId: goal.id } })}
          color="#FF4500"
        />
      )}

      {canDeleteGoal(goal) && (
        <Button title="Delete Goal" onPress={handleDeleteGoal} color="#FF6347" />
      )}

      <Button title="Back to Home" onPress={() => router.replace('/')} color="#1E90FF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1E3A8A' },
  subheader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  checkInItem: { fontSize: 16, color: '#2E8B57', marginVertical: 5 },
});

export default GoalDetailScreen;
