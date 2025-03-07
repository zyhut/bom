// types/Goal.ts

export type Goal = {
    id: string;
    title: string;
    description?: string;
    startDate: string; // Use ISO date format 'YYYY-MM-DD'
    endDate: string;
    targetDays: number;
    checkIns: string[]; // Array of dates in 'YYYY-MM-DD' format
    userId: string;
    createdAt: string; // ISO or Firestore Timestamp
    status: 'active' | 'completed' | 'failed';
    commitmentAmount: number;
    commitmentType: 'committed' | 'standard';
    paymentStatus: 'ongoing' | 'pending' | 'paid' | 'waived';
    motivation?: string;
    accountabilityPartners?: string[];
  };
  