// services/authService.js
import { auth } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// Email/Password Authentication
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign Up Error:', error);
    throw error;
  }
};

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
  }
};

// Social Media Authentication
const signInWithProvider = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Social Sign-In Error:', error);
    throw error;
  }
};

export const signInWithGoogle = () => signInWithProvider(new GoogleAuthProvider());
export const signInWithFacebook = () => signInWithProvider(new FacebookAuthProvider());
export const signInWithTwitter = () => signInWithProvider(new TwitterAuthProvider());
