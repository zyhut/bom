import { Goal } from '../types/Goal';
import { format } from 'date-fns';

export type ActionMeta = {
  label: string;
  disabled: boolean;
  type: 'checkin' | 'settle' | null;
};

export const getGoalActionMeta = (goal: Goal): ActionMeta => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const hasCheckedInToday = goal.checkIns.includes(today);

  if (today < goal.startDate) return { label: 'Not Started', disabled: true, type: null };
  if (goal.status === 'completed') return { label: 'Completed', disabled: true, type: null };
  if (goal.status === 'failed' && goal.paymentStatus === 'paid') return { label: 'Settled', disabled: true, type: null };
  if (goal.status === 'failed' && goal.paymentStatus === 'pending') return { label: 'Settle Up', disabled: false, type: 'settle' };
  if (hasCheckedInToday) return { label: 'Checked In', disabled: true, type: null };

  return { label: 'Check In Today', disabled: false, type: 'checkin' };
};