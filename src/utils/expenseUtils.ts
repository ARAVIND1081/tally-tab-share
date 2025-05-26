export interface Balance {
  from: string;
  to: string;
  amount: number;
}

export const generateBalances = (expenses: any[], users: any[]) => {
  const userBalances: { [key: string]: { [key: string]: number } } = {};

  // Initialize balances for each pair of users
  users.forEach(user1 => {
    userBalances[user1.id] = {};
    users.forEach(user2 => {
      if (user1.id !== user2.id) {
        userBalances[user1.id][user2.id] = 0;
      }
    });
  });

  // Process each expense
  expenses.forEach(expense => {
    // Distribute the expense among participants
    expense.participants.forEach(participant => {
      const paidBy = expense.paidBy;
      const owedBy = participant.userId;
      const share = participant.share;

      // Only process if both users exist in our users array
      if (userBalances[paidBy] && userBalances[owedBy] !== undefined) {
        // The person who paid is owed money by each participant
        if (paidBy !== owedBy) {
          userBalances[owedBy][paidBy] += share;
        }
      }
    });
  });

  // Convert to array format
  const balances: Balance[] = [];
  users.forEach(user1 => {
    users.forEach(user2 => {
      if (user1.id !== user2.id && userBalances[user1.id] && userBalances[user1.id][user2.id] !== undefined) {
        const amount = userBalances[user1.id][user2.id];
        if (amount > 0) {
          balances.push({ from: user1.id, to: user2.id, amount: amount });
        }
      }
    });
  });

  // Consolidate balances
  const consolidatedBalances: Balance[] = [];
  for (let i = 0; i < balances.length; i++) {
    const balance1 = balances[i];
    let isConsolidated = false;

    for (let j = i + 1; j < balances.length; j++) {
      const balance2 = balances[j];

      if (balance1.from === balance2.to && balance1.to === balance2.from) {
        // Found a matching balance to consolidate
        const netAmount = balance1.amount - balance2.amount;

        if (netAmount > 0) {
          consolidatedBalances.push({ from: balance1.from, to: balance1.to, amount: netAmount });
        } else if (netAmount < 0) {
          consolidatedBalances.push({ from: balance2.from, to: balance2.to, amount: Math.abs(netAmount) });
        }

        isConsolidated = true;
        balances.splice(j, 1); // Remove balance2 from further consideration
        break;
      }
    }

    if (!isConsolidated) {
      consolidatedBalances.push(balance1);
    }
  }

  return consolidatedBalances;
};

// Convert amount from USD (base currency) to target currency
export const convertCurrency = (amountInUSD: number, targetCurrency: { symbol: string; rate: number }): number => {
  return amountInUSD * targetCurrency.rate;
};

// Convert amount from target currency back to USD (base currency)
export const convertToUSD = (amount: number, fromCurrency: { symbol: string; rate: number }): number => {
  return amount / fromCurrency.rate;
};

// Format currency with proper conversion
export const formatCurrency = (amountInUSD: number, currency: { symbol: string; rate: number } | string = '$'): string => {
  if (typeof currency === 'string') {
    return `${currency}${amountInUSD.toFixed(2)}`;
  }
  
  // Convert from USD to the target currency
  const convertedAmount = convertCurrency(amountInUSD, currency);
  return `${currency.symbol}${convertedAmount.toFixed(2)}`;
};

// Calculate the total expenses in USD
export const getTotalExpenses = (expenses: any[]): number => {
  return expenses
    .filter(e => e.type !== 'settlement')
    .reduce((total, expense) => total + expense.amount, 0);
};

// Calculate user balance (positive means owed, negative means owes) in USD
export const getUserBalance = (balances: Balance[], userId: string): number => {
  let balance = 0;
  
  // Amount user is owed
  balances.forEach(b => {
    if (b.to === userId) balance += b.amount;
    if (b.from === userId) balance -= b.amount;
  });
  
  return balance;
};

// Group expenses by category for pie chart (amounts in USD)
export const groupExpensesByCategory = (expenses: any[]): { name: string, value: number }[] => {
  const categories: { [key: string]: number } = {};
  
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += expense.amount;
  });
  
  return Object.keys(categories).map(category => ({
    name: category,
    value: categories[category]
  }));
};
