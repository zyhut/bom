import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Button, Text, useTheme } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSettleUp: () => void;
  goalTitle?: string;
  commitmentAmount?: number;
  endDate?: string;
};

export default function GoalFailedDialog({ visible, onDismiss, onSettleUp, goalTitle, commitmentAmount, endDate }: Props) {
  const { colors } = useTheme();

  return (
    <Portal>
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      style={[{ }, styles.dialog]}>
      <Dialog.Title style={{ color: colors.error }}>Goal Failed</Dialog.Title>
      <Dialog.Content>
        <Text>
        Your goal <Text style={{ fontWeight: 'bold' }}>{goalTitle}</Text> with a commitment of
        <Text style={{ fontWeight: 'bold', color: colors.tertiary }}> ${commitmentAmount} </Text>
        due on <Text style={{ fontWeight: 'bold' }}>{endDate}</Text> has failed and needs to be settled before creating new goals.
        </Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button mode='text' onPress={onDismiss} textColor={colors.secondary}>Later</Button>
        <Button mode='text' onPress={onSettleUp}>
        Settle Up
        </Button>
      </Dialog.Actions>
    </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
  },
});