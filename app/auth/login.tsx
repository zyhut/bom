// app/auth/login.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Snackbar, Text, TextInput, Button, Divider, useTheme } from 'react-native-paper';
import { logIn, signInWithGoogle } from '../../services/authService';
import { useStore } from '../../store/useStore';
import { ThemedScreen } from '../../components/ThemedScreen';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const { colors } = useTheme();

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
    <ThemedScreen>
      <Text variant="headlineMedium" style={styles.title}>
        Log In
      </Text>

      <TextInput
        label="Email"
        mode="outlined"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <Button
        mode="contained"
        onPress={handleLogIn}
        style={styles.button}
      >
          Log In
      </Button>

      <Link href="/auth/signup">
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </Link>

      <Divider bold={true} style={styles.devider}/>
      <Text style={styles.deviderText}>or</Text>

      <Button
        mode="outlined"
        onPress={handleGoogleSignIn}
        icon="google"
        style={[styles.button, styles.googleButton]}>
          Sign In with Google
      </Button>

      <Snackbar
        visible={snackbarVisible}
        style={{ backgroundColor: colors.surfaceContainer }}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: 'Close', onPress: () => setSnackbarVisible(false) }}
      >
        <Text>{String(snackbarMessage ?? '')}</Text>
      </Snackbar>
    </ThemedScreen>
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
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  devider: {
    marginVertical: 20,
  },
  deviderText: {
    textAlign: 'center',
  },
});