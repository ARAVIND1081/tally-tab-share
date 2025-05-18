import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Expense, Participant } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import { Currency } from '@/components/CurrencySelector';

interface ExpenseFormProps {
  users: User[];
  currentUser: User;
  onAddExpense: (expense: Expense) => void;
  currency: Currency;
}

const ExpenseForm = ({ users, currentUser, onAddExpense, currency }: ExpenseFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitType, setSplitType] = useState('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<Record<string, boolean>>(
    users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {})
  );
  const [customShares, setCustomShares] = useState<Record<string, string>>(
    users.reduce((acc, user) => ({ ...acc, [user.id]: '' }), {})
  );

  const handleParticipantChange = (userId: string, checked: boolean) => {
    setSelectedParticipants({
      ...selectedParticipants,
      [userId]: checked
    });
  };

  const handleCustomShareChange = (userId: string, value: string) => {
    setCustomShares({
      ...customShares,
      [userId]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!description || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid description and amount');
      return;
    }
    
    const activeParticipants = users.filter(user => selectedParticipants[user.id]);
    if (activeParticipants.length === 0) {
      alert('Please select at least one participant');
      return;
    }
    
    let participants: Participant[] = [];
    
    if (splitType === 'equal') {
      const share = numAmount / activeParticipants.length;
      participants = activeParticipants.map(user => ({
        userId: user.id,
        share
      }));
    } else if (splitType === 'custom') {
      // Validate that all custom shares are entered
      const missingShares = activeParticipants.some(
        user => !customShares[user.id] || isNaN(parseFloat(customShares[user.id]))
      );
      
      if (missingShares) {
        alert('Please enter valid shares for all selected participants');
        return;
      }
      
      // Calculate total of custom shares
      const totalShares = activeParticipants.reduce(
        (sum, user) => sum + parseFloat(customShares[user.id] || '0'),
        0
      );
      
      if (Math.abs(totalShares - numAmount) > 0.01) {
        alert(`The sum of shares (${totalShares.toFixed(2)}) doesn't match the expense amount (${numAmount.toFixed(2)})`);
        return;
      }
      
      participants = activeParticipants.map(user => ({
        userId: user.id,
        share: parseFloat(customShares[user.id])
      }));
    }
    
    const newExpense: Expense = {
      id: uuidv4(),
      description,
      amount: numAmount,
      date: new Date().toISOString(),
      paidBy,
      participants,
      type: 'regular'
    };
    
    onAddExpense(newExpense);
    
    // Reset form
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setSelectedParticipants(users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {}));
    setCustomShares(users.reduce((acc, user) => ({ ...acc, [user.id]: '' }), {}));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ({currency.symbol})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={paidBy} onValueChange={setPaidBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select who paid" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Split Type</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="equal"
                name="splitType"
                value="equal"
                checked={splitType === 'equal'}
                onChange={() => setSplitType('equal')}
                className="accent-teal-600"
              />
              <Label htmlFor="equal" className="cursor-pointer">Equal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="custom"
                name="splitType"
                value="custom"
                checked={splitType === 'custom'}
                onChange={() => setSplitType('custom')}
                className="accent-teal-600"
              />
              <Label htmlFor="custom" className="cursor-pointer">Custom</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Participants</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                <div className="flex-1">
                  <Checkbox
                    id={`participant-${user.id}`}
                    checked={selectedParticipants[user.id]}
                    onCheckedChange={(checked) => 
                      handleParticipantChange(user.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`participant-${user.id}`}
                    className="ml-2 text-sm font-medium cursor-pointer"
                  >
                    {user.name}
                  </label>
                </div>
                
                {splitType === 'custom' && selectedParticipants[user.id] && (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={`${currency.symbol}0.00`}
                    value={customShares[user.id]}
                    onChange={(e) => handleCustomShareChange(user.id, e.target.value)}
                    className="w-24"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
          Add Expense
        </Button>
      </form>
    </div>
  );
};

export default ExpenseForm;
