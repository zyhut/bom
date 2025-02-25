// app/auth/signup.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { signUp } from '../../services/authService';
import { Snackbar } from 'react-native-paper';
import useIsomorphicLayoutEffect from '../../utils/useIsomorphicLayoutEffect'; // ✅ New import

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      setSnackbarMessage('Account created successfully!');
      setSnackbarVisible(true);

      // Delay navigation to ensure the Snackbar is visible
      setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
      
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  // Example use of useIsomorphicLayoutEffect
  useIsomorphicLayoutEffect(() => {
    console.log('Client-side only effect!');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#87CEEB' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  linkText: { color: '#1E3A8A', marginTop: 20, textAlign: 'center' },
});
