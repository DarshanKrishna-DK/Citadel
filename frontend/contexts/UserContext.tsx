import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface UserContextType {
  user: User | null;
  userRole: UserRole;
  isWalletConnected: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  setIsWalletConnected: (connected: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const value: UserContextType = {
    user,
    userRole,
    isWalletConnected,
    setUser,
    setUserRole,
    setIsWalletConnected,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
