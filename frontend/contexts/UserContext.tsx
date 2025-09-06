import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isWalletConnected: boolean;
  setIsWalletConnected: (connected: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        userRole,
        setUserRole,
        isWalletConnected,
        setIsWalletConnected,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
