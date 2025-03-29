// create.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoals } from '../../store/GoalProvider';
import { useStore } from '../../store/useStore';
import { Goal } from '../../types/Goal';
import { DatePickerModal } from 'react-native-paper-dates';
import { Switch, useTheme, IconButton, Text, TextInput, Card, Button } from 'react-native-paper';
import Tooltip from 'react-native-walkthrough-tooltip';
import { ThemedScreen } from '../../components/ThemedScreen';

const CreateGoalScreen = () => {
  const { createGoal } = useGoals();
  const user = useStore((state) => state.user);
  const router = useRouter();
  const { colors } = useTheme();

  const cleanDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = cleanDate(new Date());
  const maxStartDate = new Date(today.getTime() + 14 * 86400000);
  const maxEndDate = new Date(today.getTime() + 365 * 86400000);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentType, setCommitmentType] = useState<'standard' | 'committed'>('committed');
  const [commitmentAmount, setCommitmentAmount] = useState('');

  const [range, setRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: today,
    endDate: new Date(today.getTime() + 30 * 86400000),
  });
  const [targetDays, setTargetDays] = useState('1');
  const [open, setOpen] = useState(false);

  const [titleError, setTitleError] = useState('');
  const [commitmentError, setCommitmentError] = useState('');
  const [dateError, setDateError] = useState('');
  const [targetDaysError, setTargetDaysError] = useState('');

  const [titleAnim] = useState(new Animated.Value(0));
  const [commitmentAnim] = useState(new Animated.Value(0));
  const [dateAnim] = useState(new Animated.Value(0));
  const [targetDaysAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (range.startDate && range.endDate) {
      const days = Math.floor((range.endDate.getTime() - range.startDate.getTime()) / 86400000) + 1;
      setTargetDays(days.toString());
    }
  }, [range]);

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
    const maxTargetDays = range.startDate && range.endDate
      ? Math.floor((range.endDate.getTime() - range.startDate.getTime()) / 86400000) + 1
      : 0;
    const targetDaysNum = Number(targetDays);

    const isTitleValid = validateAndAnimate(!title, setTitleError, titleAnim, 'Goal title is required.');
    const isCommitmentValid = commitmentType === 'committed'
      ? validateAndAnimate(isNaN(Number(commitmentAmount)) || Number(commitmentAmount) < 3 || Number(commitmentAmount) > 500,
        setCommitmentError, commitmentAnim, 'Amount must be $3 to $500')
      : true;
    const isDateValid = validateAndAnimate(
      !range.startDate || !range.endDate ||
      range.startDate < today ||
      range.startDate > maxStartDate ||
      range.endDate < range.startDate ||
      range.endDate > maxEndDate,
      setDateError,
      dateAnim,
      'Start must be within 14 days. End must not be before start and must be within 1 year.'
    );
    const isTargetDaysValid = validateAndAnimate(
      isNaN(targetDaysNum) || targetDaysNum < 1 || targetDaysNum > maxTargetDays,
      setTargetDaysError,
      targetDaysAnim,
      `Target days must be between 1 and ${maxTargetDays}.`
    );

    if (isTitleValid && isCommitmentValid && isDateValid && isTargetDaysValid) {
      const newGoal: Omit<Goal, 'id'> = {
        title,
        description,
        startDate: range.startDate!.toISOString().split('T')[0],
        endDate: range.endDate!.toISOString().split('T')[0],
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
        content={<Text style={[{ backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant }, styles.tooltipText]}>{message}</Text>}
        placement="top"
        backgroundColor="transparent"
        onClose={() => setVisible(false)}
        contentStyle={styles.tooltip}
        arrowStyle={{ borderTopColor: colors.surfaceVariant }}
      >
        <IconButton
          icon="help-circle-outline"
          onPress={() => setVisible(true)}
          size={18}
          style={styles.helpIcon}
          iconColor={colors.onSurfaceVariant}
        />
      </Tooltip>
    );
  };

  return (
    <ThemedScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={[{ backgroundColor: colors.surfaceContainer }, styles.card]}>
          <Text variant="headlineMedium" style={styles.header}>Create a New Goal</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Goal Title"
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                style={[{ backgroundColor: colors.surface }, styles.input]}
                error={!!titleError}
              />
              {titleError !== '' && (
                <Animated.View style={{ opacity: titleAnim }}>
                  <Text style={{ color: colors.error }}>{titleError}</Text>
                </Animated.View>
              )}
            </View>
            <HelpTip message="Give your goal a motivating name, e.g. 'Run 5K daily'" />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Description (optional)"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              multiline
              style={[{ backgroundColor: colors.surface }, styles.input]}
            />
            <HelpTip message="Add more detail about your goal if you'd like" />
          </View>

          <View style={styles.row}>
            <View style={styles.commitmentContainer}>
              <Text>Standard</Text>
              <Switch
                value={commitmentType === 'committed'}
                onValueChange={(value) => setCommitmentType(value ? 'committed' : 'standard')}
              />
              <Text>Committed</Text>
            </View>
            <HelpTip message="Committed goals involve a commitment amount. Standard goals don’t." />
          </View>

          {commitmentType === 'committed' && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Commitment Amount (Min $3, Max $500)"
                  mode="outlined"
                  keyboardType="numeric"
                  value={commitmentAmount}
                  onChangeText={setCommitmentAmount}
                  style={[{ backgroundColor: colors.surface }, styles.input]}
                  error={!!commitmentError}
                />
                {commitmentError !== '' && (
                  <Animated.View style={{ opacity: commitmentAnim }}>
                    <Text style={{ color: colors.error }}>{commitmentError}</Text>
                  </Animated.View>
                )}
              </View>
              <HelpTip message="This is your commitment amount — what you’ll need to settle if the goal isn’t completed." />
            </View>
          )}

          <View style={{ borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Button mode="outlined" icon="calendar-month" onPress={() => setOpen(true)} style={{ marginBottom: 8 }}>
              Select Start and End Dates
            </Button>
            <Text variant="labelLarge" style={{ paddingBottom: 8 }}>
              Start: {range.startDate?.toISOString().split('T')[0]} | End: {range.endDate?.toISOString().split('T')[0]}
            </Text>
            {dateError !== '' && (
              <Animated.View style={{ opacity: dateAnim }}>
                <Text style={{ color: colors.error }}>{dateError}</Text>
              </Animated.View>
            )}
            <DatePickerModal
              locale="en"
              mode="range"
              visible={open}
              onDismiss={() => setOpen(false)}
              startDate={range.startDate}
              endDate={range.endDate}
              onConfirm={({ startDate, endDate }) => {
                setOpen(false);
                setRange({ startDate, endDate });
              }}
              validRange={{ startDate: today, endDate: maxEndDate }}
              saveLabel="Confirm"
            />

            <View style={[styles.row, { marginTop: 16 }]}>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Target Days"
                  mode="outlined"
                  value={targetDays}
                  onChangeText={setTargetDays}
                  keyboardType="numeric"
                  style={[{ backgroundColor: colors.surface }, styles.input]}
                  error={!!targetDaysError}
                />
                {targetDaysError !== '' && (
                  <Animated.View style={{ opacity: targetDaysAnim }}>
                    <Text style={{ color: colors.error }}>{targetDaysError}</Text>
                  </Animated.View>
                )}
              </View>
              <HelpTip message="The number of days you aim to check in. Feel free to leave room for cheat days!" />
            </View>
          </View>

          <Button mode="contained" onPress={handleCreate} style={styles.createButton}>
            C'Meet It!
          </Button>
        </Card>
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
  commitmentContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  helpIcon: { marginLeft: 6, marginTop: 4 },
  tooltip: { padding: 0, maxWidth: 320 },
  tooltipText: { padding: 10 },
  createButton: { marginTop: 20 },
});

export default CreateGoalScreen;