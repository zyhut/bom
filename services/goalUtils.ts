import { Goal } from '../types/Goal';
import { parseISO, addDays, isAfter } from 'date-fns';

/**
 * Determines if a goal can be deleted based on its start date.
 */
export const canDeleteGoal = (goal: Goal): boolean => {
    const startDate = parseISO(goal.startDate);
    const threeDaysAgo = Date.now() - 3 * 86400000;
    return startDate.getTime() > threeDaysAgo;
};

/**
 * Checks if a goal should be automatically marked as failed.
 */
export const shouldAutoFailGoal = (goal: Goal): boolean => {
    const endDateWithGrace = addDays(parseISO(goal.endDate), 3);
    const progressPercentage = (goal.checkIns.length / goal.targetDays) * 100;
    return isAfter(new Date(), endDateWithGrace) && progressPercentage < 100;
};

/**
 * Validates if a user can create a new goal.
 */
export const canCreateNewGoal = (goals: Goal[]): boolean => {
    const unpaidGoals = goals.filter(g => g.status === 'failed' && g.paymentStatus === 'pending');
    const activeGoals = goals.filter(g => g.status === 'active');
    
    const maxOngoingGoals = 5;
    return unpaidGoals.length === 0 && activeGoals.length < maxOngoingGoals;
};
