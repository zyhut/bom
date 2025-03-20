// store/useStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      
      setUser: (user: User | null) => set({ user }),

      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: 'bom-app-storage',
      partialize: (state) => ({ user: state.user }),
      storage: Platform.OS === 'web'
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => AsyncStorage),
    }
  )
);

// Listen for Firebase Auth changes and update Zustand store
onAuthStateChanged(auth, (user) => {
  useStore.getState().setUser(user);
});
