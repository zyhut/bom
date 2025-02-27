// app/auth/login.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { logIn, signInWithGoogle } from '../../services/authService';
import { Snackbar } from 'react-native-paper';
import { useStore } from '../../store/useStore';

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
      setUser(user); // Update Zustand store with the logged-in user
      setSnackbarMessage('Logged in successfully!');
      setSnackbarVisible(true);

      // Delay navigation to ensure the Snackbar is visible
      setTimeout(() => {
        router.push('/'); // Navigate to the home screen
      }, 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user); // Update Zustand store with the logged-in user
      setSnackbarMessage('Logged in with Google!');
      setSnackbarVisible(true);

      // Delay navigation to ensure the Snackbar is visible
      setTimeout(() => {
        router.push('/'); // Navigate to the home screen
      }, 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton title="Log In" onPress={handleLogIn} />
      <CustomButton
        title="Sign In with Google"
        onPress={handleGoogleSignIn}
        backgroundColor="#DB4437"
      />
      <Link href="/auth/signup">
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </Link>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text>{String(snackbarMessage ?? '')}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#87CEEB' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  linkText: { color: '#1E3A8A', marginTop: 20, textAlign: 'center' },
});
