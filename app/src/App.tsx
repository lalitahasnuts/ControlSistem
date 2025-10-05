import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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


// Временный компонент - всегда разрешаем доступ
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>; // Всегда показываем содержимое
  };
// Компонент для защищенных маршрутов
/*const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};*/

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />
            <Route path="/defects" element={
              <ProtectedRoute>
                <Defects />
              </ProtectedRoute>
            } />
            <Route path="/defects/:id" element={
              <ProtectedRoute>
                <DefectDetail />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;