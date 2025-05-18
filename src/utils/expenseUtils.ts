export interface Balance {
  from: string;
  to: string;
  amount: number;
}

export const generateBalances = (expenses: any[], users: any[]) => {
  const userBalances: { [key: string]: { [key: string]: number } } = {};

  // Initialize balances for each pair of users
  users.forEach(user1 => {
    users.forEach(user2 => {
      if (user1.id !== user2.id) {
        if (!userBalances[user1.id]) {
          userBalances[user1.id] = {};
        }
        userBalances[user1.id][user2.id] = 0;
      }
    });
  });

  // Process each expense
  expenses.forEach(expense => {
    const numberOfParticipants = expense.participants.length;
    
    // Distribute the expense among participants
    expense.participants.forEach(participant => {
      const owes = expense.paidBy;
      const owedTo = participant.userId;
      const share = participant.share;

      userBalances[owes][owedTo] += share;
    });
  });

  // Convert to array format
  const balances: Balance[] = [];
  users.forEach(user1 => {
    users.forEach(user2 => {
      if (user1.id !== user2.id) {
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

// Update the formatCurrency function to accept a currency symbol
export const formatCurrency = (amount: number, symbol = '$'): string => {
  return `${symbol}${amount.toFixed(2)}`;
};
