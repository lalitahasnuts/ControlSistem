// src/contexts/AuthContext.ts
import * as React from 'react';

// Интерфейс для хранилища авторизационных данных
interface AuthResponse {
  currentUser?: any;
  login(email: string, password: string): Promise<void>;
  signup(email: string, name: string, password: string): Promise<void>;
  logout(): void;
}

export const AuthContext = React.createContext<AuthResponse | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<any>();

  const login = async (email: string, password: string) => {
    console.log(`Logging in with email=${email}`);
    setTimeout(() => {
      // имитируем успешный логин
      setCurrentUser({ email }); // устанавливаем фиктивного пользователя
    }, 1000); // задержка для имитации сетевого запроса
  };

  const signup = async (email: string, name: string, password: string) => {
    // TODO: тут должна происходить регистрация нового пользователя
    console.log(`Signing up with email=${email}, name=${name}`);
    setTimeout(() => {
      // имитируем успешную регистрацию
      setCurrentUser({ email, name }); // устанавливаем фиктивного пользователя
    }, 1000); // задержка для имитации сетевого запроса
  };

  // 👉 Заглушка для выхода
  const logout = () => {
    // TODO: тут должна происходить очистка токенов и выход пользователя
    console.log('Logging out...');
    setCurrentUser(undefined); // сбрасываем текущего пользователя
  };

  return (
    <AuthContext.Provider value={{currentUser, login, signup, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

// 👈 Удобный хук для использования контекста авторизации
export const useAuth = () => React.useContext(AuthContext)!;