// src/contexts/AuthContext.ts
import * as React from 'react';

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

export const AuthContext = React.createContext<AuthResponse | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<User>();

  const login = async (email: string, password: string) => {
    console.log(`Logging in with email=${email}`);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCurrentUser({ email, id: '1' });
        resolve();
      }, 1000);
    });
  };

  const signup = async (email: string, name: string, password: string) => {
    console.log(`Signing up with email=${email}, name=${name}`);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCurrentUser({ email, name, id: '1' });
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    console.log('Logging out...');
    setCurrentUser(undefined);
  };

  const value = {
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

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};