
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Participant {
  userId: string;
  share: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  participants: Participant[];
  type?: 'regular' | 'settlement';
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}
