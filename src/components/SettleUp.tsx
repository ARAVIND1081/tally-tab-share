

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Balance, User } from '@/types/types';
import { formatCurrency } from '@/utils/expenseUtils';
import { AlertCircle } from 'lucide-react';
import { Currency } from '@/components/CurrencySelector';

interface SettleUpProps {
  balances: Balance[];
  users: User[];
  onSettleUp: (fromId: string, toId: string, amount: number) => void;
  currency: Currency;
}

const SettleUp = ({ balances, users, onSettleUp, currency }: SettleUpProps) => {
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };
  
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  
  const handleSelectBalance = (balance: Balance) => {
    setSelectedBalance(balance);
    // Convert from USD to current currency for display
    const convertedAmount = balance.amount * currency.rate;
    setSettleAmount(convertedAmount.toFixed(2));
  };
  
  const handleSettleUp = () => {
    if (!selectedBalance) return;
    
    const amount = parseFloat(settleAmount);
    const maxAmountInCurrentCurrency = selectedBalance.amount * currency.rate;
    
    if (isNaN(amount) || amount <= 0 || amount > maxAmountInCurrentCurrency) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Convert back to USD for storage
    const amountInUSD = amount / currency.rate;
    onSettleUp(selectedBalance.from, selectedBalance.to, amountInUSD);
    setSelectedBalance(null);
    setSettleAmount('');
  };

  // Format amount with current currency (convert from USD)
  const formatAmount = (amountInUSD: number): string => {
    return formatCurrency(amountInUSD, currency);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settle Up</h2>
      
      {balances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Outstanding Balances</h3>
            <div className="space-y-3">
              {balances.map((balance, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBalance === balance ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectBalance(balance)}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{getUserName(balance.from)}</span>
                    <span className="font-medium text-red-600">
                      {formatAmount(balance.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    owes {getUserName(balance.to)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Record Payment</h3>
            
            {selectedBalance ? (
              <div className="p-6 border rounded-lg">
                <div className="mb-4">
                  <strong>{getUserName(selectedBalance.from)}</strong> owes <strong>{getUserName(selectedBalance.to)}</strong> <strong>{formatAmount(selectedBalance.amount)}</strong>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Amount to Settle ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    min="0.01"
                    max={selectedBalance.amount * currency.rate}
                    step="0.01"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleSettleUp}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  Record Settlement
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 h-full">
                <p className="text-center text-gray-500 mb-2">
                  Select a balance from the left to settle up
                </p>
                <AlertCircle className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">All settled up!</p>
          <p className="text-sm text-gray-400">Everyone is square with each other</p>
        </div>
      )}
    </div>
  );
};

export default SettleUp;
