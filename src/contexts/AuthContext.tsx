
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  signup: (userData: { email: string; password: string; name: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
        };
        setUser(authUser);
        console.log('User set:', authUser);
      } else {
        setUser(null);
        console.log('User cleared');
      }
      setIsLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      console.log('Attempting login for:', credentials.email);
      setIsLoading(true);
      setError(null);
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = result.user;
      
      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'User',
      };
      
      setUser(authUser);
      console.log('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { email: string; password: string; name: string }): Promise<boolean> => {
    try {
      console.log('Attempting signup for:', userData.email);
      setIsLoading(true);
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = result.user;
      
      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });
      
      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name,
      };
      
      setUser(authUser);
      console.log('Signup successful');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out');
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
