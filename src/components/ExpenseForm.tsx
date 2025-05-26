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
import { useToast } from '@/components/ui/use-toast';
import { X, UserPlus } from 'lucide-react';
import { convertToUSD } from '@/utils/expenseUtils';

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
  const [newParticipantName, setNewParticipantName] = useState('');
  const [customParticipants, setCustomParticipants] = useState<User[]>([]);
  const { toast } = useToast();

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

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a participant name",
        variant: "destructive"
      });
      return;
    }

    const newParticipant: User = {
      id: `custom-${uuidv4()}`,
      name: newParticipantName.trim(),
      email: `${newParticipantName.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`
    };

    setCustomParticipants([...customParticipants, newParticipant]);
    setSelectedParticipants({
      ...selectedParticipants,
      [newParticipant.id]: true
    });
    setCustomShares({
      ...customShares,
      [newParticipant.id]: ''
    });
    setNewParticipantName('');

    toast({
      title: "Participant added",
      description: `${newParticipant.name} has been added to this expense.`,
    });
  };

  const handleRemoveParticipant = (userId: string) => {
    if (userId.startsWith('custom-')) {
      setCustomParticipants(customParticipants.filter(p => p.id !== userId));
    }
    
    const updatedParticipants = { ...selectedParticipants };
    delete updatedParticipants[userId];
    setSelectedParticipants(updatedParticipants);
    
    const updatedShares = { ...customShares };
    delete updatedShares[userId];
    setCustomShares(updatedShares);
    
    toast({
      title: "Participant removed",
      description: "Participant has been removed from this expense."
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    const numAmount = parseFloat(amount);
    if (!description || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid description and amount",
        variant: "destructive"
      });
      return;
    }
    
    const allUsers = [...users, ...customParticipants];
    const activeParticipants = allUsers.filter(user => selectedParticipants[user.id]);
    
    console.log('Active participants:', activeParticipants);
    
    if (activeParticipants.length === 0) {
      toast({
        title: "No participants",
        description: "Please select at least one participant",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure paidBy is valid
    const paidByUser = allUsers.find(user => user.id === paidBy);
    if (!paidByUser) {
      toast({
        title: "Invalid payer",
        description: "Please select who paid for this expense",
        variant: "destructive"
      });
      return;
    }
    
    // Convert the entered amount from the selected currency to USD for storage
    const amountInUSD = convertToUSD(numAmount, currency);
    
    let participants: Participant[] = [];
    
    if (splitType === 'equal') {
      const share = amountInUSD / activeParticipants.length;
      participants = activeParticipants.map(user => ({
        userId: user.id,
        share
      }));
    } else if (splitType === 'custom') {
      const missingShares = activeParticipants.some(
        user => !customShares[user.id] || isNaN(parseFloat(customShares[user.id]))
      );
      
      if (missingShares) {
        toast({
          title: "Missing shares",
          description: "Please enter valid shares for all selected participants",
          variant: "destructive"
        });
        return;
      }
      
      const totalShares = activeParticipants.reduce(
        (sum, user) => sum + parseFloat(customShares[user.id] || '0'),
        0
      );
      
      if (Math.abs(totalShares - numAmount) > 0.01) {
        toast({
          title: "Share mismatch",
          description: `The sum of shares (${totalShares.toFixed(2)}) doesn't match the expense amount (${numAmount.toFixed(2)})`,
          variant: "destructive"
        });
        return;
      }
      
      // Convert custom shares from selected currency to USD for storage
      participants = activeParticipants.map(user => ({
        userId: user.id,
        share: convertToUSD(parseFloat(customShares[user.id]), currency)
      }));
    }
    
    const newExpense: Expense = {
      id: uuidv4(),
      description,
      amount: amountInUSD, // Store in USD
      date: new Date().toISOString(),
      paidBy,
      participants,
      type: 'regular',
      category: 'Uncategorized'
    };
    
    console.log('New expense:', newExpense);
    
    try {
      onAddExpense(newExpense);
      
      // Reset form
      setDescription('');
      setAmount('');
      setPaidBy(currentUser.id);
      setSplitType('equal');
      setSelectedParticipants(users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {}));
      setCustomShares(users.reduce((acc, user) => ({ ...acc, [user.id]: '' }), {}));
      setCustomParticipants([]);
      
      console.log('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const allParticipants = [...users, ...customParticipants];

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
              {allParticipants.map(user => (
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
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-medium">Participants</Label>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter participant name..."
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddParticipant}
              className="bg-teal-600 hover:bg-teal-700 flex items-center gap-1"
            >
              <UserPlus size={16} />
              Add
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {allParticipants.map(user => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-md border ${
                  user.id.startsWith('custom-') ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    id={`participant-${user.id}`}
                    checked={!!selectedParticipants[user.id]}
                    onCheckedChange={(checked) => 
                      handleParticipantChange(user.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`participant-${user.id}`}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {user.name} 
                    {user.id.startsWith('custom-') && (
                      <span className="ml-1 text-xs text-teal-600">(Added)</span>
                    )}
                  </label>
                </div>
                
                {splitType === 'custom' && selectedParticipants[user.id] && (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={`${currency.symbol}0.00`}
                    value={customShares[user.id] || ''}
                    onChange={(e) => handleCustomShareChange(user.id, e.target.value)}
                    className="w-24 ml-2"
                  />
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveParticipant(user.id)}
                  className="ml-2 p-1 h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
          
          {allParticipants.length === 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No participants added yet. Add some participants to continue.</p>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={allParticipants.length === 0}
        >
          Add Expense
        </Button>
      </form>
    </div>
  );
};

export default ExpenseForm;
