// services/goalService.ts

import { db, serverTimestamp } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Goal } from '../types/Goal';

// Firestore reference
const goalsRef = collection(db, 'goals');

// ✅ Create a new goal
export const createGoal = async (goal: Goal) => {
  await addDoc(goalsRef, {
    ...goal,
    createdAt: serverTimestamp(),
    status: 'active',
  });
};

// ✅ Fetch all goals for a specific user
export const fetchGoals = async (userId: string): Promise<Goal[]> => {
  const q = query(goalsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
};

// ✅ Update an existing goal
export const updateGoal = async (goalId: string, updatedData: Partial<Goal>) => {
  const goalDoc = doc(goalsRef, goalId);
  await updateDoc(goalDoc, updatedData);
};

// ✅ Delete a goal (within 3 days of start)
export const deleteGoal = async (goalId: string) => {
  const goalDoc = doc(goalsRef, goalId);
  await deleteDoc(goalDoc);
};
