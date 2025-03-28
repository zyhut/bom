// components/CelebrationPopup.tsx
import React from 'react';
import { Dialog, Text, Portal, useTheme } from 'react-native-paper';
import LottieView from 'lottie-react-native';

const CelebrationPopup = ({
  visible,
  onDismiss,
  title = 'Goal Completed! 🎉',
}: {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
}) => {
  const { colors } = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
    >
        <Dialog.Content style={{ alignItems: 'center' }}>
          <LottieView
            source={require('../assets/animations/goal-completed.json')}
            autoPlay
            loop={false}
            style={{ width: 150, height: 150 }}
          />
          <Text variant="titleMedium" style={{ marginTop: 10, textAlign: 'center' }}>
            {title}
          </Text>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

export default CelebrationPopup;