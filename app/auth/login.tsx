// app/auth/login.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { logIn, signInWithGoogle } from '../../services/authService';
import { useStore } from '../../store/useStore';
import { ThemedScreen } from '../../components/ThemedScreen';
import { ThemedInput } from '../../components/ThemedInput';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const handleLogIn = async () => {
    try {
      const user = await logIn(email, password);
      setUser(user);
      setSnackbarMessage('Logged in successfully!');
      setSnackbarVisible(true);
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
      setSnackbarMessage('Logged in with Google!');
      setSnackbarVisible(true);
      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <ThemedText variant="headlineMedium" style={styles.title}>
        Log In
      </ThemedText>

      <ThemedInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <ThemedInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <ThemedButton onPress={handleLogIn} style={styles.button}>Log In</ThemedButton>

      <ThemedButton
        onPress={handleGoogleSignIn}
        style={[styles.button, styles.googleButton]}>
          Sign In with Google
      </ThemedButton>

      <Link href="/auth/signup">
        <ThemedText style={styles.linkText}>Don't have an account? Sign Up</ThemedText>
      </Link>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: 'Close', onPress: () => setSnackbarVisible(false) }}
      >
        <ThemedText>{String(snackbarMessage ?? '')}</ThemedText>
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 6,
    borderRadius: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
  },
});