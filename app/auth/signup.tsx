// app/auth/signup.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { signUp } from '../../services/authService';
import { Snackbar } from 'react-native-paper';
import { updateProfile } from 'firebase/auth';
import { useStore } from '../../store/useStore';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password);

      // ✅ Update the user's display name in Firebase
      if (user && name) {
        await updateProfile(user, { displayName: name });
      }

      // ✅ Update Zustand state and navigate directly to Home
      setUser({ ...user, displayName: name });

      setSnackbarMessage('Account created successfully!');
      setSnackbarVisible(true);

      setTimeout(() => {
        router.push('/'); // Navigate directly to Home
      }, 1000);
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <InputField placeholder="Name" value={name} onChangeText={setName} />
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton title="Sign Up" onPress={handleSignUp} />
      <Link href="/auth/login">
        <Text style={styles.linkText}>Already have an account? Log in</Text>
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
