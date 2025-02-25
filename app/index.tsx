// app/index.js
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text>Welcome to BetOnMyself (BOM)!</Text>
      <Link href="/auth/login">
        <Button title="Go to Login" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
