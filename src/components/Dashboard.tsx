
import { Card } from "@/components/ui/card";
import { Expense, User, Balance } from '@/types/types';
import { getTotalExpenses, getUserBalance, formatCurrency, groupExpensesByCategory } from '@/utils/expenseUtils';
import { BarChart } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Currency } from '@/components/CurrencySelector';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  balances: Balance[];
  currency: Currency;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#14b8a6', '#8b5cf6'];

const Dashboard = ({ expenses, users, balances, currency }: DashboardProps) => {
  const totalExpenses = getTotalExpenses(expenses);
  const regularExpenses = expenses.filter(e => e.type !== 'settlement');
  
  // Calculate user owes/owed
  const userBalances = users.map(user => ({
    user,
    balance: getUserBalance(balances, user.id)
  }));
  
  // Prepare expense by user chart data
  const expenseByUserData = regularExpenses.length > 0 ? 
    users.map(user => {
      const userPaid = regularExpenses
        .filter(e => e.paidBy === user.id)
        .reduce((sum, e) => sum + e.amount, 0);
        
      return {
        name: user.name,
        value: userPaid
      };
    }).filter(item => item.value > 0) : [];
    
  // Prepare expense by category chart data
  const expenseByCategoryData = groupExpensesByCategory(regularExpenses);
  
  // Recent expenses
  const recentExpenses = [...regularExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown';
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Update the BarChart to use the correct currency
  const updatedBarChart = () => (
    <BarChart data={expenseByUserData} currencySymbol={currency.symbol} />
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-teal-50 border-teal-200">
          <h3 className="text-lg font-medium mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-teal-600">{formatCurrency(totalExpenses, currency)}</p>
          <p className="text-sm text-gray-500 mt-2">{regularExpenses.length} expense(s)</p>
        </Card>
        
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium mb-1">Group Members</h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          <p className="text-sm text-gray-500 mt-2">People sharing expenses</p>
        </Card>
        
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="text-lg font-medium mb-1">Active Settlements</h3>
          <p className="text-3xl font-bold text-amber-600">{balances.length}</p>
          <p className="text-sm text-gray-500 mt-2">Pending balances</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-medium mb-4">Balance Summary</h3>
          <div className="space-y-3">
            {userBalances.map(({ user, balance }) => (
              <div 
                key={user.id} 
                className="flex justify-between p-3 rounded border"
              >
                <span className="font-medium">{user.name}</span>
                <span 
                  className={
                    balance > 0 
                      ? "font-medium text-green-600" 
                      : balance < 0 
                        ? "font-medium text-red-600" 
                        : "font-medium text-gray-600"
                  }
                >
                  {balance > 0 
                    ? `is owed ${formatCurrency(balance, currency)}` 
                    : balance < 0 
                      ? `owes ${formatCurrency(Math.abs(balance), currency)}`
                      : `is settled up`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-medium mb-4">Recent Expenses</h3>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex justify-between p-3 rounded border">
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(expense.date)} • Paid by {getUserName(expense.paidBy)}
                    </div>
                  </div>
                  <div className="font-medium">{formatCurrency(expense.amount, currency)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No expenses yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {expenseByUserData.length > 0 && (
          <div>
            <h3 className="text-xl font-medium mb-4">Expenses by Person</h3>
            <div className="h-64">
              {updatedBarChart()}
            </div>
          </div>
        )}
        
        {expenseByCategoryData.length > 0 && (
          <div>
            <h3 className="text-xl font-medium mb-4">Expenses by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, currency), 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
