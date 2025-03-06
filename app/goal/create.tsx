import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { useStore } from '../../store/useStore';
import { Goal } from '../../types/Goal';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateGoalScreen = () => {
  const { createGoal, goals } = useGoals();
  const user = useStore((state) => state.user);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [targetDays, setTargetDays] = useState('');

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 86400000));

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleCreate = async () => {
    if (!title || !commitmentAmount || !targetDays) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    const commitment = Number(commitmentAmount);
    if (isNaN(commitment) || commitment < 3 || commitment > 500) {
      Alert.alert('Validation Error', 'Commitment amount must be a number between $3 and $500.');
      return;
    }

    const today = new Date();
    const maxStartDate = new Date(today.getTime() + 14 * 86400000);
    const minEndDate = new Date(startDate.getTime() + 7 * 86400000);
    const maxEndDate = new Date(startDate.getTime() + 365 * 86400000);

    if (formatDate(startDate) < formatDate(today) || startDate > maxStartDate) {
      Alert.alert('Validation Error', 'Start date must be within the next 14 days.');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Validation Error', 'End date must be after the start date.');
      return;
    }

    if (endDate < minEndDate || endDate > maxEndDate) {
      Alert.alert('Validation Error', 'End date must be at least 7 days after start date and within 1 year.');
      return;
    }

    const maxTargetDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
    const targetDaysNum = Number(targetDays);
    if (isNaN(targetDaysNum) || targetDaysNum < 1 || targetDaysNum > maxTargetDays) {
      Alert.alert('Validation Error', `Target days must be a number between 1 and ${maxTargetDays}.`);
      return;
    }

    const newGoal: Omit<Goal, 'id'> = {
      title,
      description,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      targetDays: targetDaysNum,
      checkIns: [],
      userId: user!.uid,
      createdAt: '',
      status: 'active',
      commitmentAmount: commitment,
      commitmentType: 'app',
      paymentStatus: 'ongoing',
    };

    await createGoal(newGoal);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Goal</Text>

      <TextInput
        style={styles.input}
        placeholder="Goal Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Commitment Amount ($)"
        value={commitmentAmount}
        onChangeText={setCommitmentAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Start Date:</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={formatDate(startDate)}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          className="web-date-input"
        />
      ) : (
        <>
          <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </Pressable>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowStartDatePicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>End Date:</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={formatDate(endDate)}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          className="web-date-input"
        />
      ) : (
        <>
          <Pressable onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </Pressable>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowEndDatePicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Target Days"
        value={targetDays}
        onChangeText={setTargetDays}
        keyboardType="numeric"
      />

      <Button title="Create Goal" onPress={handleCreate} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E3A8A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
  },
});

export default CreateGoalScreen;
