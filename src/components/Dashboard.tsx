
import { Card } from "@/components/ui/card";
import { Expense, User, Balance } from '@/types/types';
import { getTotalExpenses, getUserBalance, formatCurrency } from '@/utils/expenseUtils';
import { BarChart } from '@/components/ui/chart';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  balances: Balance[];
}

const Dashboard = ({ expenses, users, balances }: DashboardProps) => {
  const totalExpenses = getTotalExpenses(expenses);
  const regularExpenses = expenses.filter(e => e.type !== 'settlement');
  
  // Calculate user owes/owed
  const userBalances = users.map(user => ({
    user,
    balance: getUserBalance(balances, user.id)
  }));
  
  // Prepare chart data
  const chartData = regularExpenses.length > 0 ? [
    {
      name: 'Expenses by User',
      data: users.map(user => {
        const userPaid = regularExpenses
          .filter(e => e.paidBy === user.id)
          .reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: user.name,
          value: userPaid
        };
      })
    }
  ] : [];
  
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-teal-50 border-teal-200">
          <h3 className="text-lg font-medium mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold text-teal-600">{formatCurrency(totalExpenses)}</p>
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
                    ? `is owed ${formatCurrency(balance)}` 
                    : balance < 0 
                      ? `owes ${formatCurrency(Math.abs(balance))}`
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
                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
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
      
      {chartData[0]?.data.some(item => item.value > 0) && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4">Expenses by Person</h3>
          <div className="h-64">
            <BarChart data={chartData[0].data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
