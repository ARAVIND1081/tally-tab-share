
import { Expense, User, Balance } from '@/types/types';

export const generateBalances = (expenses: Expense[], users: User[]): Balance[] => {
  const netBalances: Record<string, Record<string, number>> = {};
  
  // Initialize balances
  users.forEach(user1 => {
    netBalances[user1.id] = {};
    users.forEach(user2 => {
      if (user1.id !== user2.id) {
        netBalances[user1.id][user2.id] = 0;
      }
    });
  });
  
  // Calculate individual balances from expenses
  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    
    expense.participants.forEach(participant => {
      const userId = participant.userId;
      const share = participant.share;
      
      if (paidBy !== userId) {
        // User owes money to the payer
        netBalances[userId][paidBy] = (netBalances[userId][paidBy] || 0) + share;
        // Reduce in opposite direction
        netBalances[paidBy][userId] = (netBalances[paidBy][userId] || 0) - share;
      }
    });
  });
  
  // Simplify balances to one-way only
  const simplifiedBalances: Balance[] = [];
  
  users.forEach(user1 => {
    users.forEach(user2 => {
      if (user1.id < user2.id) { // Avoid duplicates
        const balance = netBalances[user1.id][user2.id];
        
        if (balance > 0) {
          // user1 owes user2
          simplifiedBalances.push({
            from: user1.id,
            to: user2.id,
            amount: balance
          });
        } else if (balance < 0) {
          // user2 owes user1
          simplifiedBalances.push({
            from: user2.id,
            to: user1.id,
            amount: -balance
          });
        }
      }
    });
  });
  
  return simplifiedBalances;
};

export const getTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => {
    if (expense.type !== 'settlement') {
      return sum + expense.amount;
    }
    return sum;
  }, 0);
};

export const getUserBalance = (balances: Balance[], userId: string): number => {
  let totalOwed = 0;
  let totalOwes = 0;
  
  balances.forEach(balance => {
    if (balance.from === userId) {
      totalOwes += balance.amount;
    }
    if (balance.to === userId) {
      totalOwed += balance.amount;
    }
  });
  
  return totalOwed - totalOwes;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};
