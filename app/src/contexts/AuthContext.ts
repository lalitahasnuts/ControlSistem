// src/contexts/AuthContext.ts
import * as React from 'react';

// Интерфейс для хранилища авторизационных данных
interface AuthResponse {
  currentUser?: any;
  login(email: string, password: string): Promise<void>;
  signup(email: string, name: string, password: string): Promise<void>;
  logout(): void;
}

// 🔴 Export added here
export const AuthContext = React.createContext<AuthResponse | undefined>(undefined);

// 👈 Компонент-поставщик контекста авторизации
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 👉 Хранение текущего пользователя и метода обновления
  const [currentUser, setCurrentUser] = React.useState<any>();

  // 👉 Заглушка для логина
  const login = async (email: string, password: string) => {
    // TODO: тут должна происходить отправка данных на сервер и получение токена
    console.log(`Logging in with email=${email}`);
    setTimeout(() => {
      // имитируем успешный логин
      setCurrentUser({ email }); // устанавливаем фиктивного пользователя
    }, 1000); // задержка для имитации сетевого запроса
  };

  // 👉 Заглушка для регистрации
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

  // 👈 Возвращаем Provider, который обеспечивает доступ к нашему контексту
  return (
    <AuthContext.Provider value={{currentUser, login, signup, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

// 👈 Удобный хук для использования контекста авторизации
export const useAuth = () => React.useContext(AuthContext)!;