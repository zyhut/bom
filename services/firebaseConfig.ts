// services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore, serverTimestamp as firebaseTimestamp } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
} from './keys';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Handle both web and native environments
export const auth = Platform.OS === 'web'
  ? getAuth(app) // Web environment: uses browser persistence by default
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage), // Native: uses AsyncStorage
    });

export const db = getFirestore(app);
export const serverTimestamp = firebaseTimestamp;
// export const messaging = getMessaging(app);
