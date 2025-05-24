
import { useState } from 'react';
import { UserCircle, Edit } from 'lucide-react';
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
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);

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

  const handleUpdateProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert('Please enter both name and email');
      return;
    }

    // Update current user in the users array
    const updatedUser = { ...currentUser, name: editName, email: editEmail };
    
    // Find and update the current user in the users array
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    
    // If current user is not in users array, add them
    if (!users.find(user => user.id === currentUser.id)) {
      onAddUser(updatedUser);
    } else {
      // This is a bit of a hack since we don't have an update function
      // We'll remove the old user and add the updated one
      onDeleteUser(currentUser.id);
      onAddUser(updatedUser);
    }
    
    setEditProfileDialogOpen(false);
  };

  const displayName = currentUser.name.trim() || 'Enter your name';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserCircle className="text-white" />
          <span>{displayName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Group Members</h3>
            <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditName(currentUser.name);
                  setEditEmail(currentUser.email);
                }}>
                  <Edit size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Your Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Your Name</Label>
                    <Input 
                      id="edit-name"
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Your Email</Label>
                    <Input 
                      id="edit-email"
                      type="email"
                      value={editEmail} 
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditProfileDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleUpdateProfile}>
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
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
