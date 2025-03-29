// app/auth/signup.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signUp } from '../../services/authService';
import { Snackbar, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { updateProfile } from 'firebase/auth';
import { useStore } from '../../store/useStore';
import { ThemedScreen } from '../../components/ThemedScreen';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const { colors } = useTheme();

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password);

      if (user && name) {
        await updateProfile(user, { displayName: name });
      }

      setUser({ ...user, displayName: name });
      setSnackbarMessage('Account created successfully!');
      setSnackbarVisible(true);

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <ThemedScreen>
      <Text variant="headlineMedium" style={styles.title}>
        Sign Up
      </Text>

      <TextInput
        label="Name"
        mode="outlined"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={handleSignUp} style={styles.button}>Sign Up</Button>

      <Link href="/auth/login">
        <Text style={styles.linkText}>
          Already have an account? Log in
        </Text>
      </Link>

      <Snackbar
        visible={snackbarVisible}
        style={{ backgroundColor: colors.surfaceContainer }}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text>{String(snackbarMessage ?? '')}</Text>
      </Snackbar>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});