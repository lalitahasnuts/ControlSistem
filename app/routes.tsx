// src/routes.tsx
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './src/hooks/useAuth';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Dashboard from '../app/src/components/Dashboard';
import Projects from '../app/src/components/Projects';
import Defects from '../app/src/components/Defects';
import Reports from '../app/src/components/Reports';
import Users from '../app/src/components/Users';
import Profile from '../app/src/components/UserProfile';
import NotFound from '../app/src/components/NotFound';

// Корректировка компонента PrivateRoute
const PrivateRoute = ({ path, element }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      path={path}
      element={currentUser ? element : <Login />}
    />
  );
};

// Составляем маршруты
const RoutesConfig = () => {
  return (
    <Routes>
      <PrivateRoute path="/dashboard" element={<Dashboard />} />
      <PrivateRoute path="/projects" element={<Projects />} />
      <PrivateRoute path="/defects/:projectId?" element={<Defects />} />
      <PrivateRoute path="/reports" element={<Reports />} />
      <PrivateRoute path="/users" element={<Users />} />
      <PrivateRoute path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesConfig;