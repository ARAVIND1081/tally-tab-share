import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import SettleUp from '@/components/SettleUp';
import Dashboard from '@/components/Dashboard';
import UserProfile from '@/components/UserProfile';
import { CurrencySelector, defaultCurrencies } from '@/components/CurrencySelector';
import { Expense, User } from '@/types/types';
import { generateBalances } from '@/utils/expenseUtils';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user1',
    name: '',
    email: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrencies[0]);
  const { toast } = useToast();

  useEffect(() => {
    // Load from localStorage if available
    const savedExpenses = localStorage.getItem('expenses');
    const savedUsers = localStorage.getItem('users');
    const savedCurrency = localStorage.getItem('currency');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    if (savedCurrency) {
      setSelectedCurrency(JSON.parse(savedCurrency));
    }
  }, []);

  useEffect(() => {
    // Calculate balances whenever expenses change
    setBalances(generateBalances(expenses, users));
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currency', JSON.stringify(selectedCurrency));
  }, [expenses, users, selectedCurrency]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    toast({
      title: "Expense added",
      description: `${expense.description} (${selectedCurrency.symbol}${expense.amount.toFixed(2)}) has been added.`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: "Expense deleted",
      description: "The expense has been removed.",
    });
  };

  const handleAddUser = (user: User) => {
    setUsers([...users, user]);
    toast({
      title: "Person added",
      description: `${user.name} has been added to your group.`,
    });
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need at least two people to split expenses.",
        variant: "destructive",
      });
      return;
    }
    
    if (id === currentUser.id) {
      toast({
        title: "Cannot delete",
        description: "You cannot remove yourself.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has any expenses
    const hasExpenses = expenses.some(expense => 
      expense.paidBy === id || expense.participants.some(p => p.userId === id)
    );
    
    if (hasExpenses) {
      toast({
        title: "Cannot delete",
        description: "This person is involved in expenses. Settle up first.",
        variant: "destructive",
      });
      return;
    }
    
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Person removed",
      description: "The person has been removed from your group.",
    });
  };

  const handleSettleUp = (fromId: string, toId: string, amount: number) => {
    const newExpense: Expense = {
      id: `settlement-${Date.now()}`,
      description: 'Settlement',
      amount: amount,
      date: new Date().toISOString(),
      paidBy: fromId,
      participants: [{ userId: toId, share: amount }],
      type: 'settlement'
    };
    
    setExpenses([...expenses, newExpense]);
    toast({
      title: "Settlement recorded",
      description: `Settlement of $${amount.toFixed(2)} has been recorded.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ExpenseSplit</h1>
          <div className="flex items-center gap-4">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
            <UserProfile 
              currentUser={currentUser}
              users={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="add">Add Expense</TabsTrigger>
            <TabsTrigger value="settle">Settle Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-0">
            <Card className="p-6">
              <Dashboard 
                expenses={expenses} 
                users={users} 
                balances={balances}
                currency={selectedCurrency}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-0">
            <Card className="p-6">
              <ExpenseList 
                expenses={expenses} 
                users={users} 
                onDeleteExpense={handleDeleteExpense}
                currency={selectedCurrency}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="add" className="mt-0">
            <Card className="p-6">
              <ExpenseForm 
                users={users} 
                currentUser={currentUser} 
                onAddExpense={handleAddExpense}
                currency={selectedCurrency}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="settle" className="mt-0">
            <Card className="p-6">
              <SettleUp 
                balances={balances} 
                users={users} 
                onSettleUp={handleSettleUp}
                currency={selectedCurrency}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
