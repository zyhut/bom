import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedButton } from './ThemedButton';
import { Dialog, Portal, Button, useTheme } from 'react-native-paper';

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
      style={[{ backgroundColor: colors.surface }, styles.dialog]}>
      <Dialog.Title style={{ color: colors.error }}>Goal Failed</Dialog.Title>
      <Dialog.Content>
        <ThemedText>
        Your goal <ThemedText style={{ fontWeight: 'bold' }}>{goalTitle}</ThemedText> with a commitment of
        <ThemedText style={{ fontWeight: 'bold', color: colors.secondary }}> ${commitmentAmount} </ThemedText>
        due on <ThemedText style={{ fontWeight: 'bold' }}>{endDate}</ThemedText> has failed and needs to be settled before creating new goals.
        </ThemedText>
      </Dialog.Content>
      <Dialog.Actions>
        <ThemedButton mode='text' onPress={onDismiss}>Later</ThemedButton>
        <ThemedButton mode='text' onPress={onSettleUp} textColor={colors.secondary}>
        Settle Up
        </ThemedButton>
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