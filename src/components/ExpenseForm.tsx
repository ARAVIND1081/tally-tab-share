
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
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

    // Create a new participant with unique ID
    const newParticipant: User = {
      id: `custom-${uuidv4()}`,
      name: newParticipantName.trim(),
      email: newParticipantEmail.trim() || `${newParticipantName.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`
    };

    // Add to custom participants
    setCustomParticipants([...customParticipants, newParticipant]);

    // Add to selected participants
    setSelectedParticipants({
      ...selectedParticipants,
      [newParticipant.id]: true
    });

    // Initialize custom share if needed
    setCustomShares({
      ...customShares,
      [newParticipant.id]: ''
    });

    // Clear inputs
    setNewParticipantName('');
    setNewParticipantEmail('');

    toast({
      title: "Participant added",
      description: `${newParticipant.name} has been added to this expense.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!description || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid description and amount",
        variant: "destructive"
      });
      return;
    }
    
    // Combine system users and custom participants
    const allUsers = [...users, ...customParticipants];
    const activeParticipants = allUsers.filter(user => selectedParticipants[user.id]);
    
    if (activeParticipants.length === 0) {
      toast({
        title: "No participants",
        description: "Please select at least one participant",
        variant: "destructive"
      });
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
        toast({
          title: "Missing shares",
          description: "Please enter valid shares for all selected participants",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate total of custom shares
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
      type: 'regular',
      category: 'Uncategorized'
    };
    
    onAddExpense(newExpense);
    
    // Reset form
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setSelectedParticipants(users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {}));
    setCustomShares(users.reduce((acc, user) => ({ ...acc, [user.id]: '' }), {}));
    setCustomParticipants([]);
  };

  // All participants (system users + custom participants)
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
        
        <div className="flex justify-between items-center">
          <Label>Participants</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" type="button">
                Add Participant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Participant</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="participantName">Name*</Label>
                  <Input
                    id="participantName"
                    placeholder="Enter participant name"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="participantEmail">Email (optional)</Label>
                  <Input
                    id="participantEmail"
                    type="email"
                    placeholder="Enter participant email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button 
                  type="button"
                  onClick={() => {
                    handleAddParticipant();
                  }}
                >
                  Add Participant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allParticipants.map(user => (
            <div key={user.id} className={`flex items-center space-x-2 p-2 border rounded ${user.id.startsWith('custom-') ? 'border-teal-200 bg-teal-50' : ''}`}>
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
                  {user.name} {user.id.startsWith('custom-') && '(Custom)'}
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
        
        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
          Add Expense
        </Button>
      </form>
    </div>
  );
};

export default ExpenseForm;
