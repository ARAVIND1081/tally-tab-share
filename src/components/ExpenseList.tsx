

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Expense, User } from '@/types/types';
import { formatCurrency } from '@/utils/expenseUtils';
import { Input } from '@/components/ui/input';
import { Currency } from '@/components/CurrencySelector';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onDeleteExpense: (id: string) => void;
  currency: Currency;
}

const ExpenseList = ({ expenses, users, onDeleteExpense, currency }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };
  
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserName(expense.paidBy).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortDirection === 'asc' 
        ? a.amount - b.amount 
        : b.amount - a.amount;
    }
  });

  const toggleSort = (column: 'date' | 'amount') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isSettlement = (expense: Expense): boolean => {
    return expense.type === 'settlement';
  };

  // Use the currency symbol for formatting (no conversion needed as amounts are in base currency)
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Expenses</h2>
      
      <div className="mb-4">
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {sortedExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('date')}
                >
                  Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('amount')}
                >
                  Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Participants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map((expense) => (
                <TableRow 
                  key={expense.id}
                  className={isSettlement(expense) ? "bg-gray-50" : ""}
                >
                  <TableCell className="font-medium">
                    {expense.description}
                    {isSettlement(expense) && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Settlement
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{getUserName(expense.paidBy)}</TableCell>
                  <TableCell>{formatAmount(expense.amount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {expense.participants.map(p => (
                        <span 
                          key={p.userId} 
                          className="bg-gray-100 px-2 py-1 rounded text-xs"
                          title={`${getUserName(p.userId)}: ${formatAmount(p.share)}`}
                        >
                          {getUserName(p.userId)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDeleteExpense(expense.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No expenses found</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;

