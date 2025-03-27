import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, ScrollView, Animated } from 'react-native';
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
import { ThemedScreen } from '../../components/ThemedScreen';

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

  const [titleError, setTitleError] = useState('');
  const [commitmentError, setCommitmentError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [targetDaysError, setTargetDaysError] = useState('');
  const [titleAnim] = useState(new Animated.Value(0));
  const [commitmentAnim] = useState(new Animated.Value(0));
  const [startDateAnim] = useState(new Animated.Value(0));
  const [endDateAnim] = useState(new Animated.Value(0));
  const [targetDaysAnim] = useState(new Animated.Value(0));

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
    setTargetDays(days.toString());
  }, [startDate, endDate]);

  const validateAndAnimate = (condition: boolean, setError: any, anim: Animated.Value, message: string) => {
    if (condition) {
      setError(message);
      Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      return false;
    } else {
      setError('');
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      return true;
    }
  };

  const handleCreate = async () => {
    const today = new Date();
    const maxStartDate = new Date(today.getTime() + 14 * 86400000);
    const minEndDate = new Date(startDate.getTime() + 7 * 86400000);
    const maxEndDate = new Date(startDate.getTime() + 365 * 86400000);
    const maxTargetDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
    const targetDaysNum = Number(targetDays);
    const isTitleValid = validateAndAnimate(!title, setTitleError, titleAnim, 'Goal title is required.');
    const isCommitmentValid = commitmentType === 'committed'
      ? validateAndAnimate(isNaN(Number(commitmentAmount)) || Number(commitmentAmount) < 3 || Number(commitmentAmount) > 500,
        setCommitmentError, commitmentAnim, 'Amount must be $3 to $500')
      : true;
    const isStartValid = validateAndAnimate(
      formatDate(startDate) < formatDate(today) || startDate > maxStartDate,
      setStartDateError,
      startDateAnim,
      'Start date must be within the next 14 days.'
    );
    const isEndValid = validateAndAnimate(
      endDate <= startDate || endDate < minEndDate || endDate > maxEndDate,
      setEndDateError,
      endDateAnim,
      'End date must be 1 week after start date and within 1 year.'
    );
    const isTargetDaysValid = validateAndAnimate(
      isNaN(targetDaysNum) || targetDaysNum < 1 || targetDaysNum > maxTargetDays,
      setTargetDaysError,
      targetDaysAnim,
      `Target days must be a number between 1 and ${maxTargetDays}.`
    );

    if (isTitleValid && isCommitmentValid && isStartValid && isEndValid && isTargetDaysValid) {
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
    }
  };

  const HelpTip = ({ message }: { message: string }) => {
    const [visible, setVisible] = useState(false);
    return (
      <Tooltip
        isVisible={visible}
        content={<ThemedText style={[{ color: colors.primary, backgroundColor: colors.background }, styles.tooltipText]}>{message}</ThemedText>}
        placement="top"
        backgroundColor="transparent"
        onClose={() => setVisible(false)}
        contentStyle={styles.tooltip}
        arrowStyle={{ borderTopColor: colors.background }}
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
    <ThemedScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedCard style={styles.card}>
          <ThemedText variant="headlineMedium" style={styles.header}>Create a New Goal</ThemedText>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedInput
                label="Goal Title"
                value={title}
                onChangeText={setTitle}
                style={[{ backgroundColor: colors.surface }, styles.input]}
                error={!!titleError}
              />
              {titleError !== '' && (
                <Animated.View style={{ opacity: titleAnim }}>
                  <PaperText style={{ color: colors.error }}>{titleError}</PaperText>
                </Animated.View>
              )}
            </View>
            <HelpTip message="Give your goal a motivating name, e.g. 'Run 5K daily'" />
          </View>

          <View style={styles.row}>
            <ThemedInput label="Description (optional)" value={description} onChangeText={setDescription} multiline style={[{ backgroundColor: colors.surface }, styles.input]} />
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
            <HelpTip message="Committed goals involve a commitment amount you’ll need to settle if the goal isn’t completed. Standard goals have no financial commitment." />
          </View>

          {commitmentType === 'committed' && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <ThemedInput
                  label="Commitment Amount (Min $3, Max $500)"
                  keyboardType="numeric"
                  value={commitmentAmount}
                  onChangeText={setCommitmentAmount}
                  style={[{ backgroundColor: colors.surface }, styles.input]}
                  error={!!commitmentError}
                />
                {commitmentError !== '' && (
                  <Animated.View style={{ opacity: commitmentAnim }}>
                    <PaperText style={{ color: colors.error }}>{commitmentError}</PaperText>
                  </Animated.View>
                )}
              </View>
              <HelpTip message="This is your commitment amount — the value you’ll need to settle if the goal isn’t completed. e.g. $20" />
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
          {startDateError !== '' && (
            <Animated.View style={{ opacity: startDateAnim }}>
              <PaperText style={{ color: colors.error }}>{startDateError}</PaperText>
            </Animated.View>
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
          {endDateError !== '' && (
            <Animated.View style={{ opacity: endDateAnim }}>
              <PaperText style={{ color: colors.error }}>{endDateError}</PaperText>
            </Animated.View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ThemedInput
                label="Target Days"
                value={targetDays}
                onChangeText={setTargetDays}
                keyboardType="numeric"
                style={[{ backgroundColor: colors.surface }, styles.input]}
                error={!!targetDaysError}
              />
              {targetDaysError !== '' && (
                <Animated.View style={{ opacity: targetDaysAnim }}>
                  <PaperText style={{ color: colors.error }}>{targetDaysError}</PaperText>
                </Animated.View>
              )}
            </View>
            <HelpTip message="The number of days you aim to check in. You can leave room for cheat days!" />
          </View>

          <ThemedButton mode="outlined" onPress={handleCreate} style={styles.createButton}>
            Create Goal
          </ThemedButton>
        </ThemedCard>
        <Button mode="text" onPress={() => router.replace('/')} style={{ margin: 20 }}>
          Back to Home
        </Button>
      </ScrollView>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { padding: 16 },
  header: { marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1 },
  label: { marginTop: 10, marginBottom: 5 },
  dateButton: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  commitmentContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8,
  },
  helpIcon: { marginLeft: 6, marginTop: 4 },
  tooltip: { padding: 0, maxWidth: 320 },
  tooltipText: { padding: 10 },
  createButton: { marginTop: 20 },
});

export default CreateGoalScreen;