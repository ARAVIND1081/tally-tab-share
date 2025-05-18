
import { useState } from 'react';
import { UserCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User as UserType } from '@/types/types';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';

interface UserProfileProps {
  currentUser: UserType;
  users: UserType[];
  onAddUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
}

const UserProfile = ({ currentUser, users, onAddUser, onDeleteUser }: UserProfileProps) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Please enter both name and email');
      return;
    }
    
    onAddUser({
      id: uuidv4(),
      name: newUserName,
      email: newUserEmail
    });
    
    setNewUserName('');
    setNewUserEmail('');
    setAddUserDialogOpen(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserCircle className="text-white" />
          <span>{currentUser.name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Group Members</h3>
          
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                <div>
                  <div>{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                {user.id !== currentUser.id && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Add Person</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Person</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    value={newUserName} 
                    onChange={(e) => setNewUserName(e.target.value)} 
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={newUserEmail} 
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddUser}>
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserProfile;
