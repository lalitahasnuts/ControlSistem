import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  email: string;
  name?: string;
  id?: string;
}

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
        setCurrentUser({ email, id: '1' });
        resolve();
      }, 1000);
    });
  };

  const signup = async (email: string, name: string, password: string): Promise<void> => {
    console.log(`Signing up with email=${email}, name=${name}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser({ email, name, id: '1' });
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