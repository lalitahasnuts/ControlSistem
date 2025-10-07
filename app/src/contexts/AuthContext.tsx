import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, RegisterData, ApiResponse, UserRole } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        setCurrentUser(user);
        authService.setAuthToken(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Starting login process...');
      const response = await authService.login(email, password);
      
      console.log('📨 Full login response:', response);
      console.log('📦 response.data:', response.data);
      
      // Используем any для обхода строгой типизации во время отладки
      const responseData: any = response;
      
      // Универсальное извлечение токена и пользователя
      let token: string;
      let user: User;

      // Вариант 1: response имеет data с token и user (стандартный ApiResponse формат)
      if (responseData.data && responseData.data.token && responseData.data.user) {
        token = responseData.data.token;
        user = responseData.data.user;
      }
      // Вариант 2: response имеет token и user напрямую
      else if (responseData.token && responseData.user) {
        token = responseData.token;
        user = responseData.user;
      }
      // Вариант 3: response имеет accessToken и user
      else if (responseData.accessToken && responseData.user) {
        token = responseData.accessToken;
        user = responseData.user;
      }
      // Вариант 4: нестандартный формат - ищем любые подходящие поля
      else {
        const possibleToken = responseData.token || responseData.accessToken || responseData.jwt || responseData.Token;
        const possibleUser = responseData.user || responseData.User || responseData.data;
        
        if (possibleToken && possibleUser) {
          token = possibleToken;
          user = possibleUser;
        } else {
          console.error('❌ Cannot find token and user in response:', responseData);
          throw new Error('Не удалось получить данные авторизации');
        }
      }

      // Валидация пользователя
      if (!user.id || !user.email) {
        console.error('❌ Invalid user data:', user);
        throw new Error('Неполные данные пользователя');
      }

      // Если нет роли, устанавливаем по умолчанию
      if (!user.role) {
        user.role = UserRole.OBSERVER;
      }

      console.log('✅ Extracted auth data:', { 
        token: token.substring(0, 10) + '...', 
        user: { email: user.email, id: user.id } 
      });

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      authService.setAuthToken(token);
      setCurrentUser(user);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: RegisterData) => {
    try {
      const response: ApiResponse<LoginResponse> = await authService.signup(userData);
      
      // Правильное извлечение данных из response.data согласно типу ApiResponse
      const { token, user } = response.data;
      
      if (!user.id || !user.email || !user.role) {
        throw new Error('Invalid user data received from server');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      authService.setAuthToken(token);
      setCurrentUser(user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    authService.setAuthToken(null);
    setCurrentUser(null);
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