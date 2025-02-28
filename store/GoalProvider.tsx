// store/GoalProvider.tsx

import React, { createContext, useEffect, useState, useContext } from 'react';
import { Goal } from '../types/Goal';
import * as goalService from '../services/goalService';
import { useStore } from './useStore'; // ✅ Use Zustand store for user state

type GoalContextType = {
  goals: Goal[];
  goalsLoading: boolean;
  createGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goalId: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState<boolean>(true);
  const user = useStore((state) => state.user); // ✅ Get user from Zustand store

  useEffect(() => {
    if (user?.uid) {
      console.log('User ID found in GoalProvider:', user.uid); // ✅ Add logging
      loadGoals(user.uid);
    } else {
      console.warn('No User ID found. Skipping goal loading.');
      setGoalsLoading(false);
    }
  }, [user?.uid]);

  const loadGoals = async (userId: string) => {
    try {
      setGoalsLoading(true);
      const fetchedGoals = await goalService.fetchGoals(userId);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setGoalsLoading(false);
    }
  };

  const createGoal = async (goal: Goal) => {
    await goalService.createGoal(goal);
    await loadGoals(user.uid);
  };

  const updateGoal = async (goalId: string, data: Partial<Goal>) => {
    await goalService.updateGoal(goalId, data);
    await loadGoals(user.uid);
  };

  const deleteGoal = async (goalId: string) => {
    await goalService.deleteGoal(goalId);
    await loadGoals(user.uid);
  };

  return (
    <GoalContext.Provider value={{ goals, goalsLoading, createGoal, updateGoal, deleteGoal }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
