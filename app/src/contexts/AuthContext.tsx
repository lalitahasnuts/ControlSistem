import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { User, RegisterData } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Функция для сохранения данных пользователя в storage
  const saveUserToStorage = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setCurrentUser(user);
  };

  // Функция для очистки данных из storage
  const clearUserFromStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentUser(null);
  };

  // Восстановление сессии при загрузке приложения
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const user: User = JSON.parse(userData);
          setCurrentUser(user);
          
          // Опционально: проверяем актуальность токена
          try {
            await authService.getCurrentUser();
          } catch (error) {
            console.warn('Token validation failed, clearing storage');
            clearUserFromStorage();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          clearUserFromStorage();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      
      // Обрабатываем разные форматы ответа
      let token: string;
      let user: User;

      if (response.token && response.user) {
        token = response.token;
        user = response.user;
      } else {
        console.error('Unexpected login response format:', response);
        throw new Error('Неверный формат ответа от сервера');
      }

      if (!user.id || !user.email) {
        throw new Error('Неполные данные пользователя');
      }

      // Сохраняем данные в storage
      saveUserToStorage(token, user);
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка входа';
      throw new Error(errorMessage);
    }
  };

  const signup = async (userData: RegisterData) => {
    try {
      console.log('Attempting registration with:', userData);
      
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      
      // Обрабатываем разные форматы ответа
      let token: string;
      let user: User;

      if (response.token && response.user) {
        token = response.token;
        user = response.user;
      } else {
        console.error('Unexpected registration response format:', response);
        throw new Error('Неверный формат ответа от сервера');
      }

      if (!user.id || !user.email) {
        throw new Error('Неполные данные пользователя');
      }

      // Сохраняем данные в storage (тот же процесс что и при логине)
      saveUserToStorage(token, user);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка регистрации';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    clearUserFromStorage();
  };

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};