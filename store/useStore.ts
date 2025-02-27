// store/useStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

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
    }
  )
);

// Listen for Firebase Auth changes and update Zustand store
onAuthStateChanged(auth, (user) => {
  useStore.getState().setUser(user);
});
