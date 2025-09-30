// src/hooks/useAuth.ts
import * as React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Интерфейс для результата хука
interface UseAuthResult {
  currentUser: any | null; // оставляем обязательным
  login(email: string, password: string): Promise<void>;
  signup(email: string, name: string, password: string): Promise<void>;
  logout(): void;
}

export const useAuth = (): UseAuthResult => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // добавляем проверку и инициализацию
  const finalContext: UseAuthResult = {
    ...context,
    currentUser: context.currentUser || null, // гарантировано имеем currentUser
  };

  return finalContext;
};