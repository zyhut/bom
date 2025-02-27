// app/index.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import SignOutButton from '../components/SignOutButton'; // ✅ Use the new SignOutButton component
import { Platform } from 'react-native';

// Fallback for useLayoutEffect during SSR
if (Platform.OS === 'web') {
  React.useLayoutEffect = React.useEffect;
}

export default function Home() {
  const [appReady, setAppReady] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAppReady(true);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (appReady && !user) {
      router.replace('/auth/login');
    }
  }, [appReady, user]);

  if (!appReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {`Welcome to BetOnMyself (BOM), ${user?.displayName ?? 'BOMer'}!`}
      </Text>
      
      <SignOutButton /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#87CEEB',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
  },
});
