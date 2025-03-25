import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { useStore } from '../../store/useStore';
import { Goal } from '../../types/Goal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Switch, useTheme, IconButton, Text as PaperText, Button } from 'react-native-paper';
import { ThemedText } from '../../components/ThemedText';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedCard } from '../../components/ThemedCard';
import { ThemedInput } from '../../components/ThemedInput';
import Tooltip from 'react-native-walkthrough-tooltip';

const CreateGoalScreen = () => {
  const { createGoal } = useGoals();
  const user = useStore((state) => state.user);
  const router = useRouter();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentType, setCommitmentType] = useState<'standard' | 'committed'>('committed');
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 86400000));
  const [targetDays, setTargetDays] = useState(`${Math.floor((endDate.getTime() - startDate.getTime()) / 86400000)}`);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
    setTargetDays(days.toString());
  }, [startDate, endDate]);

  const handleCreate = async () => {
    if (!title || !targetDays) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    if (commitmentType === 'committed') {
      const commitment = Number(commitmentAmount);
      if (isNaN(commitment) || commitment < 3 || commitment > 500) {
        Alert.alert('Validation Error', 'Commitment amount must be a number between $3 and $500.');
        return;
      }
    }

    const today = new Date();
    const maxStartDate = new Date(today.getTime() + 14 * 86400000);
    const minEndDate = new Date(startDate.getTime() + 7 * 86400000);
    const maxEndDate = new Date(startDate.getTime() + 365 * 86400000);

    if (formatDate(startDate) < formatDate(today) || startDate > maxStartDate) {
      Alert.alert('Validation Error', 'Start date must be within the next 14 days.');
      return;
    }

    if (endDate <= startDate || endDate < minEndDate || endDate > maxEndDate) {
      Alert.alert('Validation Error', 'End date must be after start date and within 1 year.');
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
      commitmentType,
      commitmentAmount: commitmentType === 'committed' ? Number(commitmentAmount) : 0,
      paymentStatus: commitmentType === 'committed' ? 'pending' : 'waived',
    };

    await createGoal(newGoal);
    router.replace('/');
  };

  const HelpTip = ({ message }: { message: string }) => {
    const [visible, setVisible] = useState(false);
  
    return (
      <Tooltip
        isVisible={visible}
        content={
          <ThemedText style={[{ color: colors.primary, backgroundColor: colors.surface}, styles.tooltipText]}>{message}</ThemedText>
        }
        placement="top"
        backgroundColor="transparent"
        onClose={() => setVisible(false)}
        contentStyle={styles.tooltip}
      >
        <IconButton
          icon="help-circle-outline"
          onPress={() => setVisible(true)}
          size={18}
          style={styles.helpIcon}
          iconColor={colors.tertiary}
        />
      </Tooltip>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedCard style={styles.card}>
        <ThemedText variant="headlineMedium" style={styles.header}>Create a New Goal</ThemedText>

        <View style={styles.row}>
          <ThemedInput label="Goal Title" value={title} onChangeText={setTitle} style={[{backgroundColor: colors.surface}, styles.input]} />
          <HelpTip message="Give your goal a motivating name, e.g. 'Run 5K daily'" />
        </View>

        <View style={styles.row}>
          <ThemedInput label="Description (optional)" value={description} onChangeText={setDescription} multiline style={[{backgroundColor: colors.surface}, styles.input]} />
          <HelpTip message="Add more detail about your goal if you'd like" />
        </View>

        <View style={styles.row}>
          <View style={styles.commitmentContainer}>
            <PaperText>Standard</PaperText>
            <Switch
              value={commitmentType === 'committed'}
              onValueChange={(value) => setCommitmentType(value ? 'committed' : 'standard')}
            />
            <PaperText>Committed</PaperText>
          </View>
          <HelpTip message="Committed goals require a $ amount and you’ll pay it if not completed. Standard goals are free." />
        </View>

        {commitmentType === 'committed' && (
          <View style={styles.row}>
            <ThemedInput
              label="Commitment Amount (Min $3, Max $500)"
              keyboardType="numeric"
              value={commitmentAmount}
              onChangeText={setCommitmentAmount}
              style={[{backgroundColor: colors.surface}, styles.input]}
            />
            <HelpTip message="This is how much you're committing to pay if the goal isn't completed. e.g. $20" />
          </View>
        )}

        <ThemedText style={styles.label}>Start Date</ThemedText>
        <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
          <ThemedText>{formatDate(startDate)}</ThemedText>
        </Pressable>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            accentColor={colors.primary}
            onChange={(_, date) => {
              setShowStartDatePicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        <ThemedText style={styles.label}>End Date</ThemedText>
        <Pressable onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
          <ThemedText>{formatDate(endDate)}</ThemedText>
        </Pressable>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            accentColor={colors.primary}
            onChange={(_, date) => {
              setShowEndDatePicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        <View style={styles.row}>
          <ThemedInput
            label="Target Days"
            value={targetDays}
            onChangeText={setTargetDays}
            keyboardType="numeric"
            style={[{backgroundColor: colors.surface}, styles.input]}
          />
          <HelpTip message="The number of days you aim to check in. You can leave room for cheat days!" />
        </View>

        <ThemedButton mode="contained" onPress={handleCreate} style={styles.createButton}>
          Create Goal
        </ThemedButton>
      </ThemedCard>
      <Button mode="text" onPress={() => router.replace('/')} style={{ margin: 20 }}>
        Back to Home
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
  },
  dateButton: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  commitmentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  helpIcon: {
    marginLeft: 6,
    marginTop: 4,
  },
  tooltip: {
    padding: 0,
    maxWidth: 320,
  },
  tooltipText: {
    padding: 10,
  },
  createButton: {
    marginTop: 20,
  },
});

export default CreateGoalScreen;