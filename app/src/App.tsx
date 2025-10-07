import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from 'antd';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import Defects from './components/Defects';
import Projects from './components/Projects';
import Reports from './components/Reports';
import Users from './components/Users';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectDetail from './components/ProjectDetail';
import DefectDetail from './components/DefectDetail';
import UserProfile from './components/UserProfile';
import { useAuth } from './hooks/useAuth';
import './App.css';
import { authService } from './services/authService';

const { Content } = Layout;

// Временный компонент - всегда разрешаем доступ
/*const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>; // Всегда показываем содержимое
};*/

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>; // Или компонент загрузки
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// Компонент макета с Header и Sidebar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Публичные маршруты без layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Защищенные маршруты с layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/defects" element={
              <ProtectedRoute>
                <AppLayout>
                  <Defects />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/defects/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <DefectDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <UserProfile />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Перенаправление на dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Проверяем валидность токена при запуске приложения
const token = localStorage.getItem('authToken');
if (token) {
  // Можно добавить запрос для проверки валидности токена
  authService.setAuthToken(token);
}

export default App;