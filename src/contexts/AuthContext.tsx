
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginCredentials, SignupCredentials } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('registered_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user with matching email and password
      const user = users.find((u: any) => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name
        };
        setUser(authUser);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem('registered_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if email already exists
      if (users.some((u: any) => u.email === credentials.email)) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email: credentials.email,
        password: credentials.password,
        name: credentials.name
      };
      
      // Save to registered users
      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
      
      // Auto login after signup
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      };
      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
