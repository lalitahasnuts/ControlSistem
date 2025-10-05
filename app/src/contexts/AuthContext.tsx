import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthResponse {
  currentUser?: User;
  login(email: string, password: string): Promise<void>;
  signup(email: string, name: string, password: string): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthResponse | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>();

  const login = async (email: string, password: string): Promise<void> => {
    console.log(`Logging in with email=${email}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser({ 
          id: '1', 
          email, 
          firstName: 'Пользователь',
          lastName: 'Тестовый',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        resolve();
      }, 1000);
    });
  };

  const signup = async (email: string, name: string, password: string): Promise<void> => {
    console.log(`Signing up with email=${email}, name=${name}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser({ 
          id: '1', 
          email, 
          firstName: name,
          lastName: '',
          role: UserRole.ENGINEER,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        resolve();
      }, 1000);
    });
  };

  const logout = (): void => {
    console.log('Logging out...');
    setCurrentUser(undefined);
  };

  const value: AuthResponse = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}